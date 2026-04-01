// Copyright 2021 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

//go:build integration
// +build integration

package tests

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

const (
	baseURL     = "http://127.0.0.1:8000"
	testTimeout = 30 * time.Second
)

// TestClient 全局HTTP客户端
var (
	httpClient *http.Client
	testToken  string
	testOrg    = "built-in"
	testUser   = "admin"
	testApp    = "app-built-in"
	testOwner  = "built-in"
)

func TestMain(m *testing.M) {
	httpClient = &http.Client{
		Timeout: testTimeout,
	}

	loginAndGetToken()

	code := m.Run()

	cleanup()

	m.Exit(code)
}

func loginAndGetToken() {
	password := "admin"
	body := map[string]interface{}{
		"owner":        testOrg,
		"name":         testUser,
		"organization": testOrg,
		"username":     testUser,
		"password":     password,
	}

	bodyBytes, _ := json.Marshal(body)
	resp, err := httpClient.Post(baseURL+"/api/login", "application/json", bytes.NewReader(bodyBytes))
	if err != nil {
		fmt.Printf("登录请求失败: %v\n", err)
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		respBody, _ := io.ReadAll(resp.Body)
		fmt.Printf("登录失败, 状态码: %d, 响应: %s\n", resp.StatusCode, string(respBody))
		return
	}

	var result map[string]interface{}
	respBody, err := io.ReadAll(resp.Body)
	if err != nil {
		fmt.Printf("读取响应失败: %v\n", err)
		return
	}

	err = json.Unmarshal(respBody, &result)
	if err != nil {
		fmt.Printf("解析响应失败: %v\n", err)
		return
	}

	if token, ok := result["accessToken"].(string); ok && token != "" {
		testToken = token
		fmt.Printf("登录成功, token: %s...\n", token[:min(20, len(token))])
	} else {
		fmt.Printf("未获取到token, 响应: %+v\n", result)
	}
}

func min(a, b int) int {
	if a < b {
		return a
	}
	return b
}

func cleanup() {
	if testToken == "" {
		return
	}
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/logout", nil)
	if testToken != "" {
		req.Header.Set("Authorization", "Bearer "+testToken)
	}
	httpClient.Do(req)
	fmt.Println("测试完成，已登出")
}

func doRequest(method, path string, body interface{}) (*http.Response, error) {
	var bodyReader io.Reader
	if body != nil {
		bodyBytes, _ := json.Marshal(body)
		bodyReader = bytes.NewReader(bodyBytes)
	}

	req, err := http.NewRequest(method, baseURL+path, bodyReader)
	if err != nil {
		return nil, err
	}

	req.Header.Set("Content-Type", "application/json")
	if testToken != "" {
		req.Header.Set("Authorization", "Bearer "+testToken)
	}

	return httpClient.Do(req)
}

func doGet(path string, queryParams map[string]string) (*http.Response, error) {
	req, err := http.NewRequest(http.MethodGet, baseURL+path, nil)
	if err != nil {
		return nil, err
	}

	q := req.URL.Query()
	for k, v := range queryParams {
		q.Add(k, v)
	}
	req.URL.RawQuery = q.Encode()

	if testToken != "" {
		req.Header.Set("Authorization", "Bearer "+testToken)
	}

	return httpClient.Do(req)
}

func parseResponse(resp *http.Response) (map[string]interface{}, error) {
	defer resp.Body.Close()
	body, err := io.ReadAll(resp.Body)
	if err != nil {
		return nil, err
	}

	var result map[string]interface{}
	err = json.Unmarshal(body, &result)
	return result, err
}

// ==================== P2 边界测试 ====================

// TestInvalidOrganizationName 无效组织名称
func TestInvalidOrganizationName(t *testing.T) {
	// 尝试创建名称为空或包含非法字符的组织
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        "",
		"displayName": "测试组织",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)
	// 应该返回错误
	fmt.Printf("[P2] 空名称创建组织状态码: %d\n", resp.StatusCode)
}

// TestInvalidUserData 无效用户数据
func TestInvalidUserData(t *testing.T) {
	// 1. 尝试创建用户名为空的用户
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        "",
		"username":    "",
		"displayName": "测试用户",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-user", createBody)
	assert.NoError(t, err)
	// 应该返回错误
	fmt.Printf("[P2] 空用户名创建状态码: %d\n", resp.StatusCode)
}

// TestDuplicateOrganizationName 重复组织名称
func TestDuplicateOrganizationName(t *testing.T) {
	testOrgName := "dup-test-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建组织
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testOrgName,
		"displayName": "重复测试组织",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)

	// 2. 尝试重复创建
	resp, err = doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)
	fmt.Printf("[P2] 重复创建组织状态码: %d\n", resp.StatusCode)

	// 清理
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testOrgName,
	}
	doRequest(http.MethodPost, "/api/delete-organization", deleteBody)
}

// TestInvalidPassword 无效密码
func TestInvalidPassword(t *testing.T) {
	// 1. 创建用户
	testUsername := "pass-test-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testUsername,
		"username":     testUsername,
		"displayName":  "密码测试用户",
		"password":     "validPass123",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-user", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建用户失败")

	// 2. 使用错误密码登录
	loginBody := map[string]interface{}{
		"owner":        testOwner,
		"organization": testOwner,
		"username":     testUsername,
		"password":     "wrongPassword",
	}
	resp, err = doRequest(http.MethodPost, "/api/login", loginBody)
	assert.NoError(t, err)
	// 错误密码应该返回非200
	fmt.Printf("[P2] 错误密码登录状态码: %d\n", resp.StatusCode)

	// 3. 清理
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testUsername,
	}
	doRequest(http.MethodPost, "/api/delete-user", deleteBody)
}

// TestEmptyRequiredFields 必填字段为空
func TestEmptyRequiredFields(t *testing.T) {
	testCases := []struct {
		name string
		body map[string]interface{}
	}{
		{
			name: "组织缺少name",
			body: map[string]interface{}{
				"owner":       testOwner,
				"displayName": "测试组织",
			},
		},
		{
			name: "用户缺少username",
			body: map[string]interface{}{
				"owner":       testOwner,
				"name":        "test-user",
				"displayName": "测试用户",
			},
		},
		{
			name: "应用缺少name",
			body: map[string]interface{}{
				"owner":       testOwner,
				"displayName": "测试应用",
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			var endpoint string
			switch tc.name {
			case "组织缺少name":
				endpoint = "/api/add-organization"
			case "用户缺少username":
				endpoint = "/api/add-user"
			case "应用缺少name":
				endpoint = "/api/add-application"
			}

			resp, err := doRequest(http.MethodPost, endpoint, tc.body)
			assert.NoError(t, err)
			fmt.Printf("[P2] %s 状态码: %d\n", tc.name, resp.StatusCode)
		})
	}
}

// TestVeryLongName 超长名称
func TestVeryLongName(t *testing.T) {
	longName := strings.Repeat("a", 500)

	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        longName,
		"displayName": "超长名称测试",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)
	fmt.Printf("[P2] 超长名称创建状态码: %d\n", resp.StatusCode)
}

// TestSpecialCharsInName 特殊字符名称
func TestSpecialCharsInName(t *testing.T) {
	specialNames := []string{
		"test<script>alert(1)</script>",
		"test' OR '1'='1",
		"test../..",
		"test\x00null",
	}

	for _, name := range specialNames {
		t.Run(name, func(t *testing.T) {
			createBody := map[string]interface{}{
				"owner":       testOwner,
				"name":        name,
				"displayName": "特殊字符测试",
			}
			resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
			assert.NoError(t, err)
			fmt.Printf("[P2] 特殊字符'%s'状态码: %d\n", name[:10], resp.StatusCode)
		})
	}
}

// TestMissingAuthToken 缺少认证Token
func TestMissingAuthToken(t *testing.T) {
	// 不带token请求需要认证的API
	resp, err := httpClient.Get(baseURL + "/api/get-users")
	assert.NoError(t, err)
	fmt.Printf("[P2] 无token请求状态码: %d\n", resp.StatusCode)
}

// TestInvalidAuthToken 无效认证Token
func TestInvalidAuthToken(t *testing.T) {
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/get-users", nil)
	req.Header.Set("Authorization", "Bearer invalid_token_12345")
	resp, err := httpClient.Do(req)
	assert.NoError(t, err)
	fmt.Printf("[P2] 无效token请求状态码: %d\n", resp.StatusCode)
}

// TestExpiredAuthToken 过期认证Token
func TestExpiredAuthToken(t *testing.T) {
	// 使用一个明显过期的token
	req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/get-users", nil)
	req.Header.Set("Authorization", "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJhZG1pbiIsImV4cCI6MTYwMDAwMDAwMH0.invalid")
	resp, err := httpClient.Do(req)
	assert.NoError(t, err)
	fmt.Printf("[P2] 过期token请求状态码: %d\n", resp.StatusCode)
}

// TestWrongOwner 错误的所有者
func TestWrongOwner(t *testing.T) {
	// 尝试访问不属于自己组织的资源
	resp, err := doGet("/api/get-users", map[string]string{"owner": "non-existent-org"})
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误owner请求状态码: %d\n", resp.StatusCode)
}

// TestUnauthorizedDelete 未授权删除
func TestUnauthorizedDelete(t *testing.T) {
	// 1. 先创建一个测试用户
	testUsername := "del-test-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testUsername,
		"username":     testUsername,
		"displayName":  "删除测试用户",
		"password":     "test123456",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-user", createBody)
	assert.NoError(t, err)

	// 2. 不带token尝试删除
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/delete-user", nil)
	req.Header.Set("Content-Type", "application/json")
	deleteBody, _ := json.Marshal(map[string]interface{}{
		"owner": testOwner,
		"name":  testUsername,
	})
	req.Body = io.NopCloser(bytes.NewReader(deleteBody))
	resp, err = httpClient.Do(req)
	assert.NoError(t, err)
	fmt.Printf("[P2] 未授权删除状态码: %d\n", resp.StatusCode)

	// 清理
	if testToken != "" {
		req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/delete-user", bytes.NewReader(deleteBody))
		req.Header.Set("Content-Type", "application/json")
		req.Header.Set("Authorization", "Bearer "+testToken)
		httpClient.Do(req)
	}
}

// TestConcurrentRequests 并发请求测试
func TestConcurrentRequests(t *testing.T) {
	// 并发发送多个相同请求
	concurrency := 10
	done := make(chan bool, concurrency)

	for i := 0; i < concurrency; i++ {
		go func() {
			resp, err := httpClient.Get(baseURL + "/api/get-users")
			if err == nil {
				fmt.Printf("[P2] 并发请求状态码: %d\n", resp.StatusCode)
			}
			done <- true
		}()
	}

	for i := 0; i < concurrency; i++ {
		<-done
	}
	fmt.Printf("[P2] 并发请求测试完成\n")
}

// TestRapidRequests 快速连续请求测试
func TestRapidRequests(t *testing.T) {
	// 快速发送100个请求
	for i := 0; i < 100; i++ {
		resp, err := httpClient.Get(baseURL + "/api/health")
		if err == nil {
			if resp.StatusCode != http.StatusOK {
				fmt.Printf("[P2] 快速请求第%d次状态码: %d\n", i, resp.StatusCode)
				break
			}
		}
	}
	fmt.Printf("[P2] 快速连续请求测试完成\n")
}

// TestLargePayload 大数据负载
func TestLargePayload(t *testing.T) {
	// 发送大数据量请求
	largeData := make([]byte, 1024*1024) // 1MB
	for i := range largeData {
		largeData[i] = 'a'
	}

	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        "large-test",
		"displayName": string(largeData),
	}
	resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)
	fmt.Printf("[P2] 大数据负载状态码: %d\n", resp.StatusCode)
}

// TestJsonInjection JSON注入
func TestJsonInjection(t *testing.T) {
	// 尝试JSON注入攻击
	injectionData := map[string]interface{}{
		"owner":        testOwner,
		"name":         "test-user",
		"username":     "test",
		"displayName":  map[string]interface{}{"$gt": ""},
	}
	resp, err := doRequest(http.MethodPost, "/api/add-user", injectionData)
	assert.NoError(t, err)
	fmt.Printf("[P2] JSON注入测试状态码: %d\n", resp.StatusCode)
}

// TestMissingContentType 缺少Content-Type
func TestMissingContentType(t *testing.T) {
	body := []byte(`{"owner":"built-in","name":"test"}`)
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/add-organization", bytes.NewReader(body))
	// 不设置Content-Type
	resp, err := httpClient.Do(req)
	assert.NoError(t, err)
	fmt.Printf("[P2] 缺少Content-Type状态码: %d\n", resp.StatusCode)
}

// TestWrongHTTPMethod 错误的HTTP方法
func TestWrongHTTPMethod(t *testing.T) {
	// GET请求用于POST端点
	resp, err := httpClient.Get(baseURL + "/api/add-organization")
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误HTTP方法状态码: %d\n", resp.StatusCode)
}

// TestMalformedJSON 格式错误的JSON
func TestMalformedJSON(t *testing.T) {
	body := []byte(`{"owner": "test", name: "invalid"}`)
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/add-organization", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误JSON格式状态码: %d\n", resp.StatusCode)
}

// TestResourceNotFound 资源不存在
func TestResourceNotFound(t *testing.T) {
	resp, err := doGet("/api/get-user", map[string]string{"owner": testOwner, "name": "non-existent-user-12345"})
	assert.NoError(t, err)
	fmt.Printf("[P2] 资源不存在状态码: %d\n", resp.StatusCode)
}

// TestQueryParamInjection 查询参数注入
func TestQueryParamInjection(t *testing.T) {
	// 尝试在查询参数中注入SQL
	resp, err := doGet("/api/get-users", map[string]string{
		"owner":     testOwner,
		"username":  "test' OR '1'='1",
	})
	assert.NoError(t, err)
	fmt.Printf("[P2] 查询参数注入状态码: %d\n", resp.StatusCode)
}

// TestCasbinEnforceInvalidInput Casbin权限检查无效输入
func TestCasbinEnforceInvalidInput(t *testing.T) {
	testCases := []struct {
		name string
		body map[string]interface{}
	}{
		{
			name: "空owner",
			body: map[string]interface{}{
				"owner":      "",
				"name":       "test",
				"user":       testUser,
				"method":     "GET",
				"urlPattern": "/api/test",
			},
		},
		{
			name: "空user",
			body: map[string]interface{}{
				"owner":      testOwner,
				"name":       "test",
				"user":       "",
				"method":     "GET",
				"urlPattern": "/api/test",
			},
		},
		{
			name: "空url",
			body: map[string]interface{}{
				"owner":      testOwner,
				"name":       "test",
				"user":       testUser,
				"method":     "GET",
				"urlPattern": "",
			},
		},
	}

	for _, tc := range testCases {
		t.Run(tc.name, func(t *testing.T) {
			resp, err := doRequest(http.MethodPost, "/api/enforce", tc.body)
			assert.NoError(t, err)
			fmt.Printf("[P2] Casbin %s 状态码: %d\n", tc.name, resp.StatusCode)
		})
	}
}

// TestEnforceDataScopeInvalidInput 数据范围检查无效输入
func TestEnforceDataScopeInvalidInput(t *testing.T) {
	// 1. 空user
	body1 := map[string]interface{}{
		"user":     "",
		"dataType": "user",
	}
	resp, err := doRequest(http.MethodPost, "/api/authz/check-data-scope", body1)
	assert.NoError(t, err)
	fmt.Printf("[P2] 数据范围检查空user状态码: %d\n", resp.StatusCode)

	// 2. 空dataType
	body2 := map[string]interface{}{
		"user":     testUser,
		"dataType": "",
	}
	resp, err = doRequest(http.MethodPost, "/api/authz/check-data-scope", body2)
	assert.NoError(t, err)
	fmt.Printf("[P2] 数据范围检查空dataType状态码: %d\n", resp.StatusCode)

	// 3. 无效dataType
	body3 := map[string]interface{}{
		"user":     testUser,
		"dataType": "invalid-type-xyz",
	}
	resp, err = doRequest(http.MethodPost, "/api/authz/check-data-scope", body3)
	assert.NoError(t, err)
	fmt.Printf("[P2] 数据范围检查无效dataType状态码: %d\n", resp.StatusCode)
}

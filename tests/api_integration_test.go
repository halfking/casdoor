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
	// 初始化HTTP客户端
	httpClient = &http.Client{
		Timeout: testTimeout,
	}

	// 运行测试前先登录获取token
	loginAndGetToken()

	// 运行所有测试
	code := m.Run()

	// 清理测试数据
	cleanup()

	m.Exit(code)
}

// loginAndGetToken 登录并获取token
func loginAndGetToken() {
	password := "admin" // 默认密码
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

// cleanup 清理测试数据
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

// doRequest 发送HTTP请求
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

// doGet GET请求
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

// parseResponse 解析响应
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

// ==================== P0 冒烟测试 ====================

// TestHealth 健康检查
func TestHealth(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/health")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.Equal(t, "OK", result["status"])
	fmt.Printf("[P0] Health检查通过: %v\n", result["status"])
}

// TestGetVersionInfo 获取版本信息
func TestGetVersionInfo(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-version-info")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 版本信息: %s\n", result["version"])
}

// TestGetOrganizations 获取组织列表
func TestGetOrganizations(t *testing.T) {
	resp, err := doGet("/api/get-organizations", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["data"])
	fmt.Printf("[P0] 获取组织列表成功\n")
}

// TestGetUsers 获取用户列表
func TestGetUsers(t *testing.T) {
	resp, err := doGet("/api/get-users", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["data"])
	fmt.Printf("[P0] 获取用户列表成功\n")
}

// TestGetUser 获取用户详情
func TestGetUser(t *testing.T) {
	resp, err := doGet("/api/get-user", map[string]string{"owner": testOwner, "name": testUser})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 获取用户详情成功\n")
}

// TestGetApplication 获取应用详情
func TestGetApplication(t *testing.T) {
	resp, err := doGet("/api/get-application", map[string]string{"owner": testOwner, "name": testApp})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["data"])
	fmt.Printf("[P0] 获取应用详情成功\n")
}

// TestGetPermissions 获取权限列表
func TestGetPermissions(t *testing.T) {
	resp, err := doGet("/api/get-permissions", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["data"])
	fmt.Printf("[P0] 获取权限列表成功\n")
}

// TestEnforce 权限检查
func TestEnforce(t *testing.T) {
	body := map[string]interface{}{
		"owner":      testOwner,
		"name":       "Permission-built-in",
		"user":       testUser,
		"method":     "GET",
		"urlPattern": "/api/get-users",
	}

	resp, err := doRequest(http.MethodPost, "/api/enforce", body)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 权限检查结果: %v\n", result)
}

// TestAuthzCheckFeature 特性权限检查
func TestAuthzCheckFeature(t *testing.T) {
	body := map[string]interface{}{
		"user":    testUser,
		"feature": "some-feature",
	}

	resp, err := doRequest(http.MethodPost, "/api/authz/check-feature", body)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

// TestAuthzCheckDataScope 数据范围检查
func TestAuthzCheckDataScope(t *testing.T) {
	body := map[string]interface{}{
		"user":     testUser,
		"dataType": "user",
	}

	resp, err := doRequest(http.MethodPost, "/api/authz/check-data-scope", body)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
}

// TestGetAccount 获取账户信息
func TestGetAccount(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-account")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["data"])
	fmt.Printf("[P0] 获取账户信息成功\n")
}

// TestUserinfo 获取用户信息
func TestUserinfo(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/userinfo")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["sub"])
	fmt.Printf("[P0] 获取用户信息成功, sub: %v\n", result["sub"])
}

// TestGetMenus 获取菜单列表
func TestGetMenus(t *testing.T) {
	resp, err := doGet("/api/get-menus", map[string]string{"owner": testOwner, "menu": "global"})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["data"])
	fmt.Printf("[P0] 获取菜单列表成功\n")
}

// TestGetResources 获取资源列表
func TestGetResources(t *testing.T) {
	resp, err := doGet("/api/get-resources", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 获取资源列表成功\n")
}

// TestBffResolvePermissions BFF解析权限
func TestBffResolvePermissions(t *testing.T) {
	body := map[string]interface{}{
		"user":   testUser,
		"app":    testApp,
		"action": "read",
	}

	resp, err := doRequest(http.MethodPost, "/api/bff/resolve-permissions", body)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] BFF权限解析完成\n")
}

// TestLogout 登出
func TestLogout(t *testing.T) {
	resp, err := httpClient.Post(baseURL+"/api/logout", "", nil)
	assert.NoError(t, err)
	fmt.Printf("[P0] 登出状态码: %d\n", resp.StatusCode)
}

// TestGetDashBoard 获取仪表盘信息
func TestGetDashBoard(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-dashboard")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 获取仪表盘信息成功\n")
}

// TestGetAppLogin 获取应用登录信息
func TestGetAppLogin(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-app-login")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 获取应用登录信息成功\n")
}

// TestGetSystemInfo 获取系统信息
func TestGetSystemInfo(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-system-info")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 获取系统信息成功\n")
}

// TestOidcDiscovery OIDC发现
func TestOidcDiscovery(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/.well-known/openid-configuration")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["issuer"])
	fmt.Printf("[P0] OIDC发现成功, issuer: %v\n", result["issuer"])
}

// TestJwks 获取JWKS
func TestJwks(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/.well-known/jwks")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	assert.NotNil(t, result["keys"])
	fmt.Printf("[P0] JWKS获取成功\n")
}

// ==================== P1 功能测试 ====================

// TestOrganizationCRUD 组织CRUD
func TestOrganizationCRUD(t *testing.T) {
	testOrgName := "test-org-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// Create
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testOrgName,
		"displayName": "测试组织",
		"websiteUrl":  "https://test.com",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建组织失败")
	fmt.Printf("[P1] 创建组织: %s 成功\n", testOrgName)

	// Read
	resp, err = doGet("/api/get-organization", map[string]string{"owner": testOwner, "name": testOrgName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Update
	updateBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testOrgName,
		"displayName": "测试组织-已更新",
	}
	resp, err = doRequest(http.MethodPost, "/api/update-organization", updateBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "更新组织失败")

	// Delete
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testOrgName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-organization", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除组织失败")
	fmt.Printf("[P1] 组织CRUD测试完成\n")
}

// TestUserCRUD 用户CRUD
func TestUserCRUD(t *testing.T) {
	testUsername := "test-user-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// Create
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testUsername,
		"createdBy":    testUser,
		"username":     testUsername,
		"displayName":  "测试用户",
		"password":     "test123456",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-user", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建用户失败")
	fmt.Printf("[P1] 创建用户: %s 成功\n", testUsername)

	// Read
	resp, err = doGet("/api/get-user", map[string]string{"owner": testOwner, "name": testUsername})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Update
	updateBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testUsername,
		"displayName": "测试用户-已更新",
		"phone":       "13800138000",
	}
	resp, err = doRequest(http.MethodPost, "/api/update-user", updateBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "更新用户失败")

	// Delete
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testUsername,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-user", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除用户失败")
	fmt.Printf("[P1] 用户CRUD测试完成\n")
}

// TestApplicationCRUD 应用CRUD
func TestApplicationCRUD(t *testing.T) {
	testAppName := "test-app-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// Create
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testAppName,
		"displayName":  "测试应用",
		"organization": testOwner,
	}
	resp, err := doRequest(http.MethodPost, "/api/add-application", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建应用失败")
	fmt.Printf("[P1] 创建应用: %s 成功\n", testAppName)

	// Read
	resp, err = doGet("/api/get-application", map[string]string{"owner": testOwner, "name": testAppName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Update
	updateBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testAppName,
		"displayName": "测试应用-已更新",
	}
	resp, err = doRequest(http.MethodPost, "/api/update-application", updateBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "更新应用失败")

	// Delete
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testAppName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-application", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除应用失败")
	fmt.Printf("[P1] 应用CRUD测试完成\n")
}

// TestRoleCRUD 角色CRUD
func TestRoleCRUD(t *testing.T) {
	testRoleName := "test-role-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// Create
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testRoleName,
		"displayName": "测试角色",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-role", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建角色失败")
	fmt.Printf("[P1] 创建角色: %s 成功\n", testRoleName)

	// Read
	resp, err = doGet("/api/get-role", map[string]string{"owner": testOwner, "name": testRoleName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Delete
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testRoleName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-role", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除角色失败")
	fmt.Printf("[P1] 角色CRUD测试完成\n")
}

// TestPermissionCRUD 权限CRUD
func TestPermissionCRUD(t *testing.T) {
	testPermName := "test-perm-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// Create
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testPermName,
		"displayName": "测试权限",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-permission", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建权限失败")
	fmt.Printf("[P1] 创建权限: %s 成功\n", testPermName)

	// Read
	resp, err = doGet("/api/get-permission", map[string]string{"owner": testOwner, "name": testPermName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Delete
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testPermName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-permission", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除权限失败")
	fmt.Printf("[P1] 权限CRUD测试完成\n")
}

// TestProviderCRUD 提供商CRUD
func TestProviderCRUD(t *testing.T) {
	testProviderName := "test-provider-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// Create
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testProviderName,
		"displayName": "测试提供商",
		"type":        "GitHub",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-provider", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建提供商失败")
	fmt.Printf("[P1] 创建提供商: %s 成功\n", testProviderName)

	// Read
	resp, err = doGet("/api/get-provider", map[string]string{"owner": testOwner, "name": testProviderName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// Delete
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testProviderName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-provider", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除提供商失败")
	fmt.Printf("[P1] 提供商CRUD测试完成\n")
}

// ==================== P1 业务流测试 ====================

// TestUserRegistrationLoginFlow 用户注册登录完整流程
func TestUserRegistrationLoginFlow(t *testing.T) {
	flowUsername := "flow-user-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")
	testPassword := "Test123456!"

	// 1. 用户注册
	registerBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         flowUsername,
		"username":     flowUsername,
		"displayName":  "流程测试用户",
		"password":     testPassword,
		"email":        flowUsername + "@test.com",
	}
	resp, err := doRequest(http.MethodPost, "/api/signup", registerBody)
	assert.NoError(t, err)
	// 注册可能返回200或400(如果用户已存在)
	fmt.Printf("[P1] 用户注册: %s, 状态码: %d\n", flowUsername, resp.StatusCode)

	// 2. 用户登录
	loginBody := map[string]interface{}{
		"owner":        testOwner,
		"organization": testOwner,
		"username":     flowUsername,
		"password":     testPassword,
	}
	resp, err = doRequest(http.MethodPost, "/api/login", loginBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	result, err := parseResponse(resp)
	assert.NoError(t, err)

	flowToken := ""
	if token, ok := result["accessToken"].(string); ok {
		flowToken = token
		fmt.Printf("[P1] 用户登录成功, token: %s...\n", token[:min(20, len(token))])
	}

	// 3. 获取账户信息
	if flowToken != "" {
		req, _ := http.NewRequest(http.MethodGet, baseURL+"/api/get-account", nil)
		req.Header.Set("Authorization", "Bearer "+flowToken)
		resp, _ = httpClient.Do(req)
		assert.Equal(t, http.StatusOK, resp.StatusCode)
		fmt.Printf("[P1] 获取账户信息成功\n")
	}

	// 4. 修改密码
	if flowToken != "" {
		updatePasswordBody := map[string]interface{}{
			"owner":         testOwner,
			"name":          flowUsername,
			"oldPassword":   testPassword,
			"newPassword":   "Test654321!",
		}
		resp, err = doRequest(http.MethodPost, "/api/set-password", updatePasswordBody)
		assert.NoError(t, err)
		fmt.Printf("[P1] 修改密码状态码: %d\n", resp.StatusCode)
	}

	// 5. 使用新密码登录验证
	loginBody2 := map[string]interface{}{
		"owner":        testOwner,
		"organization": testOwner,
		"username":     flowUsername,
		"password":     "Test654321!",
	}
	resp, err = doRequest(http.MethodPost, "/api/login", loginBody2)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "新密码登录失败")
	fmt.Printf("[P1] 新密码登录验证成功\n")

	// 清理 - 删除测试用户
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  flowUsername,
	}
	doRequest(http.MethodPost, "/api/delete-user", deleteBody)
	fmt.Printf("[P1] 用户注册登录流程测试完成\n")
}

// TestDepartmentFlow 部门组织架构流程
func TestDepartmentFlow(t *testing.T) {
	testDeptName := "test-dept-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建部门
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testDeptName,
		"displayName":  "测试部门",
		"organization": testOwner,
	}
	resp, err := doRequest(http.MethodPost, "/api/add-department", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建部门失败")
	fmt.Printf("[P1] 创建部门: %s 成功\n", testDeptName)

	// 2. 获取部门列表
	resp, err = doGet("/api/get-departments", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 创建岗位
	testPostName := "test-post-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")
	postBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testPostName,
		"displayName":  "测试岗位",
		"organization": testOwner,
		"department":   testDeptName,
	}
	resp, err = doRequest(http.MethodPost, "/api/add-post", postBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建岗位失败")
	fmt.Printf("[P1] 创建岗位: %s 成功\n", testPostName)

	// 4. 获取岗位列表
	resp, err = doGet("/api/get-posts", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 5. 清理岗位
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testPostName,
	}
	doRequest(http.MethodPost, "/api/delete-post", deleteBody)

	// 6. 清理部门
	deleteDeptBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testDeptName,
	}
	doRequest(http.MethodPost, "/api/delete-department", deleteDeptBody)

	fmt.Printf("[P1] 部门组织架构流程测试完成\n")
}

// TestGroupFlow 组管理流程
func TestGroupFlow(t *testing.T) {
	testGroupName := "test-group-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建组
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testGroupName,
		"displayName": "测试组",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-group", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建组失败")
	fmt.Printf("[P1] 创建组: %s 成功\n", testGroupName)

	// 2. 获取组列表
	resp, err = doGet("/api/get-groups", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 创建用户并添加到组
	testUserForGroup := "test-group-user-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")
	userBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testUserForGroup,
		"username":     testUserForGroup,
		"displayName":  "组测试用户",
		"password":     "test123456",
	}
	resp, err = doRequest(http.MethodPost, "/api/add-user", userBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建用户失败")

	// 4. 从组移除用户
	removeBody := map[string]interface{}{
		"owner":       testOwner,
		"userOwner":   testOwner,
		"userName":    testUserForGroup,
		"groupOwner":  testOwner,
		"groupName":   testGroupName,
	}
	resp, err = doRequest(http.MethodPost, "/api/remove-user-from-group", removeBody)
	assert.NoError(t, err)
	fmt.Printf("[P1] 组管理流程完成\n")

	// 清理用户
	deleteUserBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testUserForGroup,
	}
	doRequest(http.MethodPost, "/api/delete-user", deleteUserBody)

	// 清理组
	deleteGroupBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testGroupName,
	}
	doRequest(http.MethodPost, "/api/delete-group", deleteGroupBody)
}

// TestInvitationFlow 邀请流程
func TestInvitationFlow(t *testing.T) {
	testEmail := "invite-test-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "") + "@test.com"

	// 1. 创建邀请
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         "invite-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", ""),
		"displayName":  "测试邀请",
		"organization":  testOwner,
		"inviteCode":   strings.ReplaceAll(time.Now().Format("150405"), "", ""),
		"email":        testEmail,
	}
	resp, err := doRequest(http.MethodPost, "/api/add-invitation", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建邀请失败")
	fmt.Printf("[P1] 创建邀请成功\n")

	// 2. 获取邀请列表
	resp, err = doGet("/api/get-invitations", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 清理邀请
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  "invite-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", ""),
	}
	doRequest(http.MethodPost, "/api/delete-invitation", deleteBody)

	fmt.Printf("[P1] 邀请流程测试完成\n")
}

// TestWebhookFlow Webhook流程
func TestWebhookFlow(t *testing.T) {
	testWebhookName := "test-webhook-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建Webhook
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testWebhookName,
		"displayName": "测试Webhook",
		"url":         "https://test.com/webhook",
		"events":      []string{"signup", "login"},
	}
	resp, err := doRequest(http.MethodPost, "/api/add-webhook", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建Webhook失败")
	fmt.Printf("[P1] 创建Webhook: %s 成功\n", testWebhookName)

	// 2. 获取Webhook列表
	resp, err = doGet("/api/get-webhooks", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 清理Webhook
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testWebhookName,
	}
	doRequest(http.MethodPost, "/api/delete-webhook", deleteBody)

	fmt.Printf("[P1] Webhook流程测试完成\n")
}

// TestCasbinModelFlow Casbin模型管理流程
func TestCasbinModelFlow(t *testing.T) {
	testModelName := "test-model-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建模型
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testModelName,
		"displayName": "测试模型",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-model", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建模型失败")
	fmt.Printf("[P1] 创建Casbin模型: %s 成功\n", testModelName)

	// 2. 获取模型列表
	resp, err = doGet("/api/get-models", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 创建适配器
	testAdapterName := "test-adapter-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")
	adapterBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testAdapterName,
		"displayName": "测试适配器",
	}
	resp, err = doRequest(http.MethodPost, "/api/add-adapter", adapterBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建适配器失败")

	// 4. 清理适配器
	deleteAdapterBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testAdapterName,
	}
	doRequest(http.MethodPost, "/api/delete-adapter", deleteAdapterBody)

	// 5. 清理模型
	deleteModelBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testModelName,
	}
	doRequest(http.MethodPost, "/api/delete-model", deleteModelBody)

	fmt.Printf("[P1] Casbin模型管理流程测试完成\n")
}

// TestSessionFlow 会话管理流程
func TestSessionFlow(t *testing.T) {
	testSessionID := "test-session-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建会话
	createBody := map[string]interface{}{
		"owner":      testOwner,
		"sessionId":  testSessionID,
		"sessionKey": "test-key",
		"sessionValue": "test-value",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-session", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建会话失败")
	fmt.Printf("[P1] 创建会话: %s 成功\n", testSessionID)

	// 2. 获取会话
	resp, err = doGet("/api/get-session", map[string]string{"owner": testOwner, "sessionId": testSessionID})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 更新会话
	updateBody := map[string]interface{}{
		"owner":        testOwner,
		"sessionId":    testSessionID,
		"sessionValue": "updated-value",
	}
	resp, err = doRequest(http.MethodPost, "/api/update-session", updateBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "更新会话失败")

	// 4. 删除会话
	deleteBody := map[string]interface{}{
		"owner":     testOwner,
		"sessionId": testSessionID,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-session", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除会话失败")

	fmt.Printf("[P1] 会话管理流程测试完成\n")
}

// TestRecordFlow 记录管理流程
func TestRecordFlow(t *testing.T) {
	// 1. 获取记录列表
	resp, err := doGet("/api/get-records", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	fmt.Printf("[P1] 获取记录列表成功\n")

	// 2. 添加记录
	createBody := map[string]interface{}{
		"owner":         testOwner,
		"name":          "record-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", ""),
		"organization":  testOwner,
		"object":        "test-object",
		"action":        "test-action",
		"response":      "test-response",
	}
	resp, err = doRequest(http.MethodPost, "/api/add-record", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "添加记录失败")
	fmt.Printf("[P1] 添加记录成功\n")
}

// TestTokenFlow 令牌管理流程
func TestTokenFlow(t *testing.T) {
	testTokenName := "test-token-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建令牌
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testTokenName,
		"displayName": "测试令牌",
		"user":        testUser,
		"application": testApp,
	}
	resp, err := doRequest(http.MethodPost, "/api/add-token", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建令牌失败")
	fmt.Printf("[P1] 创建令牌: %s 成功\n", testTokenName)

	// 2. 获取令牌
	resp, err = doGet("/api/get-token", map[string]string{"owner": testOwner, "name": testTokenName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 删除令牌
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testTokenName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-token", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除令牌失败")

	fmt.Printf("[P1] 令牌管理流程测试完成\n")
}

// TestFormFlow 表单管理流程
func TestFormFlow(t *testing.T) {
	testFormName := "test-form-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建表单
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testFormName,
		"displayName": "测试表单",
		"organization": testOwner,
	}
	resp, err := doRequest(http.MethodPost, "/api/add-form", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建表单失败")
	fmt.Printf("[P1] 创建表单: %s 成功\n", testFormName)

	// 2. 获取表单
	resp, err = doGet("/api/get-form", map[string]string{"owner": testOwner, "name": testFormName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 删除表单
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testFormName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-form", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除表单失败")

	fmt.Printf("[P1] 表单管理流程测试完成\n")
}

// TestSiteFlow 站点管理流程
func TestSiteFlow(t *testing.T) {
	testSiteName := "test-site-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建站点
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testSiteName,
		"displayName":  "测试站点",
		"organization": testOwner,
	}
	resp, err := doRequest(http.MethodPost, "/api/add-site", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建站点失败")
	fmt.Printf("[P1] 创建站点: %s 成功\n", testSiteName)

	// 2. 获取站点
	resp, err = doGet("/api/get-site", map[string]string{"owner": testOwner, "name": testSiteName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 删除站点
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testSiteName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-site", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除站点失败")

	fmt.Printf("[P1] 站点管理流程测试完成\n")
}

// TestCertFlow 证书管理流程
func TestCertFlow(t *testing.T) {
	testCertName := "test-cert-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建证书
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        testCertName,
		"displayName": "测试证书",
		"type":        "x509",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-cert", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建证书失败")
	fmt.Printf("[P1] 创建证书: %s 成功\n", testCertName)

	// 2. 获取证书
	resp, err = doGet("/api/get-cert", map[string]string{"owner": testOwner, "name": testCertName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 删除证书
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testCertName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-cert", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除证书失败")

	fmt.Printf("[P1] 证书管理流程测试完成\n")
}

// TestRuleFlow 规则管理流程
func TestRuleFlow(t *testing.T) {
	testRuleName := "test-rule-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建规则
	createBody := map[string]interface{}{
		"owner":      testOwner,
		"name":       testRuleName,
		"displayName": "测试规则",
		"model":      "basic",
		"adapter":    "internal",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-rule", createBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "创建规则失败")
	fmt.Printf("[P1] 创建规则: %s 成功\n", testRuleName)

	// 2. 获取规则
	resp, err = doGet("/api/get-rule", map[string]string{"owner": testOwner, "name": testRuleName})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)

	// 3. 删除规则
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testRuleName,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-rule", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除规则失败")

	fmt.Printf("[P1] 规则管理流程测试完成\n")
}

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
	"os"
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
	httpClient  *http.Client
	testToken   string
	testOrg     = "built-in"
	testUser    = "admin"
	testApp     = "app-built-in"
	testUserID  = ""
	testOwner   = "built-in"
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

	os.Exit(code)
}

// loginAndGetToken 登录并获取token
func loginAndGetToken() {
	// 获取环境变量中的密码，如果没有则使用默认密码
	password := os.Getenv("CASDOOR_TEST_ADMIN_PASSWORD")
	if password == "" {
		fmt.Println("警告: 未设置CASDOOR_TEST_ADMIN_PASSWORD环境变量，测试可能失败")
		password = "" // 密码必须通过环境变量设置
	}

	body := map[string]interface{}{
		"owner":         testOrg,
		"name":          testUser,
		"organization":  testOrg,
		"username":      testUser,
		"password":      password,
		"application":   testApp,
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
	// 发送登出请求
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/logout", nil)
	if testToken != "" {
		req.Header.Set("Authorization", "Bearer "+testToken)
	}
	httpClient.Do(req)
	fmt.Println("测试完成，已登出")
}

// doRequest 发送HTTP请求的辅助函数
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
	// API返回小写"ok"
	assert.Equal(t, "ok", result["status"])
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

	if data, ok := result["data"].(map[string]interface{}); ok {
		testUserID, _ = data["id"].(string)
		fmt.Printf("[P0] 用户ID: %s\n", testUserID)
	}
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

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 特性权限检查结果: %v\n", result)
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

	result, err := parseResponse(resp)
	assert.NoError(t, err)
	fmt.Printf("[P0] 数据范围检查结果: %v\n", result)
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
	_, _ = parseResponse(resp)
	// 资源可能为空，这是正常的
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
	fmt.Printf("[P0] BFF权限解析结果: %v\n", result)
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
	_, _ = parseResponse(resp)
	fmt.Printf("[P0] 获取仪表盘信息成功\n")
}

// TestGetAppLogin 获取应用登录信息
func TestGetAppLogin(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-app-login")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	_, _ = parseResponse(resp)
	fmt.Printf("[P0] 获取应用登录信息成功\n")
}

// TestGetSystemInfo 获取系统信息
func TestGetSystemInfo(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/get-system-info")
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	_, _ = parseResponse(resp)
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
		"owner":     testOwner,
		"name":      testUsername,
		"createdBy": testUser,
		"username":  testUsername,
		"displayName": "测试用户",
		"password":  "test123456",
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
		"owner":         testOwner,
		"name":          testUsername,
		"displayName":   "测试用户-已更新",
		"phone":        "13800138000",
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
		"owner":       testOwner,
		"name":        testAppName,
		"displayName": "测试应用",
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
		"owner":   testOwner,
		"name":    testPermName,
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
		"owner":       testOwner,
		"name":        flowUsername,
		"username":    flowUsername,
		"displayName": "流程测试用户",
		"password":    testPassword,
		"email":       flowUsername + "@test.com",
	}
	resp, err := doRequest(http.MethodPost, "/api/signup", registerBody)
	assert.NoError(t, err)
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

	// 3. 清理组
	deleteGroupBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testGroupName,
	}
	doRequest(http.MethodPost, "/api/delete-group", deleteGroupBody)

	fmt.Printf("[P1] 组管理流程测试完成\n")
}

// TestSessionFlow 会话管理流程
func TestSessionFlow(t *testing.T) {
	testSessionID := "test-session-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建会话
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"sessionId":    testSessionID,
		"sessionKey":   "test-key",
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

	// 3. 删除会话
	deleteBody := map[string]interface{}{
		"owner":     testOwner,
		"sessionId": testSessionID,
	}
	resp, err = doRequest(http.MethodPost, "/api/delete-session", deleteBody)
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode, "删除会话失败")

	fmt.Printf("[P1] 会话管理流程测试完成\n")
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

// TestRecordFlow 记录管理流程
func TestRecordFlow(t *testing.T) {
	// 1. 获取记录列表
	resp, err := doGet("/api/get-records", map[string]string{"owner": testOwner})
	assert.NoError(t, err)
	assert.Equal(t, http.StatusOK, resp.StatusCode)
	fmt.Printf("[P1] 获取记录列表成功\n")
}

// TestFormFlow 表单管理流程
func TestFormFlow(t *testing.T) {
	testFormName := "test-form-" + strings.ReplaceAll(time.Now().Format("20060102150405"), "-", "")

	// 1. 创建表单
	createBody := map[string]interface{}{
		"owner":        testOwner,
		"name":         testFormName,
		"displayName":  "测试表单",
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
		"owner":       testOwner,
		"name":        testRuleName,
		"displayName": "测试规则",
		"model":       "basic",
		"adapter":     "internal",
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

	// 3. 清理模型
	deleteModelBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testModelName,
	}
	doRequest(http.MethodPost, "/api/delete-model", deleteModelBody)

	fmt.Printf("[P1] Casbin模型管理流程测试完成\n")
}

// ==================== P2 边界与安全测试 ====================

// TestInvalidOrganizationName 无效组织名称
func TestInvalidOrganizationName(t *testing.T) {
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        "",
		"displayName": "测试组织",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-organization", createBody)
	assert.NoError(t, err)
	fmt.Printf("[P2] 空名称创建组织状态码: %d\n", resp.StatusCode)
}

// TestInvalidUserData 无效用户数据
func TestInvalidUserData(t *testing.T) {
	createBody := map[string]interface{}{
		"owner":       testOwner,
		"name":        "",
		"username":    "",
		"displayName": "测试用户",
	}
	resp, err := doRequest(http.MethodPost, "/api/add-user", createBody)
	assert.NoError(t, err)
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

	// 使用错误密码登录
	loginBody := map[string]interface{}{
		"owner":        testOwner,
		"organization": testOwner,
		"username":     testUsername,
		"password":     "wrongPassword",
	}
	resp, err = doRequest(http.MethodPost, "/api/login", loginBody)
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误密码登录状态码: %d\n", resp.StatusCode)

	// 清理
	deleteBody := map[string]interface{}{
		"owner": testOwner,
		"name":  testUsername,
	}
	doRequest(http.MethodPost, "/api/delete-user", deleteBody)
}

// TestMissingAuthToken 缺少认证Token
func TestMissingAuthToken(t *testing.T) {
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

// TestWrongOwner 错误的所有者
func TestWrongOwner(t *testing.T) {
	resp, err := doGet("/api/get-users", map[string]string{"owner": "non-existent-org"})
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误owner请求状态码: %d\n", resp.StatusCode)
}

// TestResourceNotFound 资源不存在
func TestResourceNotFound(t *testing.T) {
	resp, err := doGet("/api/get-user", map[string]string{"owner": testOwner, "name": "non-existent-user-12345"})
	assert.NoError(t, err)
	fmt.Printf("[P2] 资源不存在状态码: %d\n", resp.StatusCode)
}

// TestJsonInjection JSON注入
func TestJsonInjection(t *testing.T) {
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

// TestMalformedJSON 格式错误的JSON
func TestMalformedJSON(t *testing.T) {
	body := []byte(`{"owner": "test", name: "invalid"}`)
	req, _ := http.NewRequest(http.MethodPost, baseURL+"/api/add-organization", bytes.NewReader(body))
	req.Header.Set("Content-Type", "application/json")
	resp, err := httpClient.Do(req)
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误JSON格式状态码: %d\n", resp.StatusCode)
}

// TestWrongHTTPMethod 错误的HTTP方法
func TestWrongHTTPMethod(t *testing.T) {
	resp, err := httpClient.Get(baseURL + "/api/add-organization")
	assert.NoError(t, err)
	fmt.Printf("[P2] 错误HTTP方法状态码: %d\n", resp.StatusCode)
}

// TestConcurrentRequests 并发请求测试
func TestConcurrentRequests(t *testing.T) {
	concurrency := 5
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

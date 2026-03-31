// Copyright 2026 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0

package controllers

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/util"
)

type BffResolvePermissionsRequest struct {
	Tenant string   `json:"tenant"`
	Subject string  `json:"subject"`
	Checks []string `json:"checks"`
}

type BffCheckDataScopeRequest struct {
	Tenant       string                 `json:"tenant"`
	Subject      string                 `json:"subject"`
	ResourceType string                 `json:"resourceType"`
	Operation    string                 `json:"operation"`
	RecordContext map[string]interface{} `json:"recordContext"`
}

// ResolvePermissionsForBff
// @Title ResolvePermissionsForBff
// @Tag Permission API
// @Description resolve feature permissions for BFF integration
// @Param   body    body   controllers.BffResolvePermissionsRequest  true        "The bff resolve permissions request"
// @Success 200 {object} controllers.Response The Response object
// @router /bff/resolve-permissions [post]
func (c *ApiController) ResolvePermissionsForBff() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var req BffResolvePermissionsRequest
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &req)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	tenant := req.Tenant
	if tenant == "" {
		tenant = user.Owner
	}
	if !user.IsGlobalAdmin() && tenant != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized tenant operation: %s", tenant))
		return
	}

	subject := req.Subject
	if subject == "" {
		subject = user.GetId()
	}
	subjectUser, err := object.GetUser(subject)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if subjectUser == nil {
		c.ResponseError(fmt.Sprintf(c.T("general:The user: %s doesn't exist"), subject))
		return
	}
	if !user.IsGlobalAdmin() && subjectUser.Owner != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized subject: %s", subject))
		return
	}

	results := make([]map[string]interface{}, 0, len(req.Checks))
	for _, check := range req.Checks {
		path := strings.TrimSpace(check)
		if path == "" {
			continue
		}
		if !strings.HasPrefix(path, "/") {
			path = "/" + path
		}

		allowed, err := object.CheckApiPermission(subject, tenant, path, "GET")
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		results = append(results, map[string]interface{}{
			"resource":      path,
			"allowed":       allowed,
			"matchedPolicy": "api-permission",
		})
	}

	c.ResponseOk(map[string]interface{}{
		"tenant":  tenant,
		"subject": subject,
		"results": results,
		"traceId": util.GetRandomName(),
	})
}

// CheckDataScopeForBff
// @Title CheckDataScopeForBff
// @Tag Permission API
// @Description check data scope for BFF integration
// @Param   body    body   controllers.BffCheckDataScopeRequest  true        "The bff data scope check request"
// @Success 200 {object} controllers.Response The Response object
// @router /bff/check-data-scope [post]
func (c *ApiController) CheckDataScopeForBff() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var req BffCheckDataScopeRequest
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &req)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	tenant := req.Tenant
	if tenant == "" {
		tenant = user.Owner
	}
	if !user.IsGlobalAdmin() && tenant != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized tenant operation: %s", tenant))
		return
	}

	subject := req.Subject
	if subject == "" {
		subject = user.GetId()
	}
	subjectUser, err := object.GetUser(subject)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if subjectUser == nil {
		c.ResponseError(fmt.Sprintf(c.T("general:The user: %s doesn't exist"), subject))
		return
	}
	if !user.IsGlobalAdmin() && subjectUser.Owner != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized subject: %s", subject))
		return
	}

	if strings.TrimSpace(req.ResourceType) == "" {
		c.ResponseError("resourceType is required")
		return
	}

	policyPath := fmt.Sprintf("/data/%s", strings.TrimSpace(req.ResourceType))
	method := normalizeActionToMethod(req.Operation)
	allowed, err := object.CheckApiPermission(subject, tenant, policyPath, method)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	scopeFilter := map[string]interface{}{}
	if allowed {
		scopeFilter["tenant"] = tenant
	}

	c.ResponseOk(map[string]interface{}{
		"allowed":      allowed,
		"scopeFilter":  scopeFilter,
		"fieldRules":   []map[string]interface{}{},
		"obligations":  []string{},
		"matchedPolicy": "api-permission",
		"traceId":      util.GetRandomName(),
	})
}

// GetTenantTreeForBff
// @Title GetTenantTreeForBff
// @Tag Organization API
// @Description get tenant tree snapshot for BFF integration
// @Success 200 {object} controllers.Response The Response object
// @router /bff/tenant-tree [get]
func (c *ApiController) GetTenantTreeForBff() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	owner := c.Ctx.Input.Query("owner")
	if owner == "" {
		owner = "built-in"
	}

	var organizations []*object.Organization
	var err error
	if user.IsGlobalAdmin() {
		organizations, err = object.GetOrganizations(owner)
	} else {
		organizations, err = object.GetOrganizations(owner, user.Owner)
	}
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	res := make([]map[string]interface{}, 0, len(organizations))
	for _, org := range organizations {
		res = append(res, map[string]interface{}{
			"tenant":      org.Name,
			"displayName": org.DisplayName,
			"owner":       org.Owner,
		})
	}

	c.ResponseOk(map[string]interface{}{
		"items":   res,
		"traceId": util.GetRandomName(),
	})
}

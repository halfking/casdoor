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

package controllers

import (
	"encoding/json"
	"fmt"
	"strings"

	"github.com/beego/beego/v2/core/utils/pagination"
	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/util"
)

type FeatureCheckRequest struct {
	Tenant   string                 `json:"tenant"`
	Subject  string                 `json:"subject"`
	Resource string                 `json:"resource"`
	Action   string                 `json:"action"`
	Context  map[string]interface{} `json:"context"`
}

type FeatureBatchCheckRequest struct {
	Tenant string                `json:"tenant"`
	Checks []FeatureCheckRequest `json:"checks"`
}

func normalizeActionToMethod(action string) string {
	action = strings.TrimSpace(strings.ToUpper(action))
	switch action {
	case "", "READ", "LIST", "GET":
		return "GET"
	case "WRITE", "CREATE", "UPDATE", "DELETE", "POST", "PUT", "PATCH":
		return "POST"
	default:
		return action
	}
}

func normalizeFeaturePath(resource string) string {
	resource = strings.TrimSpace(resource)
	if resource == "" {
		return resource
	}
	if strings.HasPrefix(resource, "/") {
		return resource
	}
	return "/" + resource
}

// GetPermissions
// @Title GetPermissions
// @Tag Permission API
// @Description get permissions
// @Param   owner     query    string  true        "The owner of permissions"
// @Success 200 {array} object.Permission The Response object
// @router /get-permissions [get]
func (c *ApiController) GetPermissions() {
	owner := c.Ctx.Input.Query("owner")
	limit := c.Ctx.Input.Query("pageSize")
	page := c.Ctx.Input.Query("p")
	field := c.Ctx.Input.Query("field")
	value := c.Ctx.Input.Query("value")
	sortField := c.Ctx.Input.Query("sortField")
	sortOrder := c.Ctx.Input.Query("sortOrder")

	if limit == "" || page == "" {
		permissions, err := object.GetPermissions(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(permissions)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetPermissionCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.NewPaginator(c.Ctx.Request, limit, count)
		permissions, err := object.GetPaginationPermissions(owner, paginator.Offset(), limit, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(permissions, paginator.Nums())
	}
}

// GetPermissionsBySubmitter
// @Title GetPermissionsBySubmitter
// @Tag Permission API
// @Description get permissions by submitter
// @Success 200 {array} object.Permission The Response object
// @router /get-permissions-by-submitter [get]
func (c *ApiController) GetPermissionsBySubmitter() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	permissions, err := object.GetPermissionsBySubmitter(user.Owner, user.Name)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(permissions, len(permissions))
}

// GetPermissionsByRole
// @Title GetPermissionsByRole
// @Tag Permission API
// @Description get permissions by role
// @Param   id     query    string  true        "The id ( owner/name ) of the role"
// @Success 200 {array} object.Permission The Response object
// @router /get-permissions-by-role [get]
func (c *ApiController) GetPermissionsByRole() {
	id := c.Ctx.Input.Query("id")
	permissions, err := object.GetPermissionsByRole(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(permissions, len(permissions))
}

// GetPermission
// @Title GetPermission
// @Tag Permission API
// @Description get permission
// @Param   id     query    string  true        "The id ( owner/name ) of the permission"
// @Success 200 {object} object.Permission The Response object
// @router /get-permission [get]
func (c *ApiController) GetPermission() {
	id := c.Ctx.Input.Query("id")

	permission, err := object.GetPermission(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(permission)
}

// UpdatePermission
// @Title UpdatePermission
// @Tag Permission API
// @Description update permission
// @Param   id     query    string  true        "The id ( owner/name ) of the permission"
// @Param   body    body   object.Permission  true        "The details of the permission"
// @Success 200 {object} controllers.Response The Response object
// @router /update-permission [post]
func (c *ApiController) UpdatePermission() {
	id := c.Ctx.Input.Query("id")
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var permission object.Permission
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &permission)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	idOwner, _, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	if permission.Owner != "" && permission.Owner != idOwner {
		c.ResponseError("permission owner and id owner mismatch")
		return
	}

	if !user.IsGlobalAdmin() && idOwner != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized tenant operation: %s", idOwner))
		return
	}

	permission.Owner = idOwner

	c.Data["json"] = wrapActionResponse(object.UpdatePermission(id, &permission))
	c.ServeJSON()
}

// AddPermission
// @Title AddPermission
// @Tag Permission API
// @Description add permission
// @Param   body    body   object.Permission  true        "The details of the permission"
// @Success 200 {object} controllers.Response The Response object
// @router /add-permission [post]
func (c *ApiController) AddPermission() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var permission object.Permission
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &permission)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	if permission.Owner == "" {
		permission.Owner = user.Owner
	}

	if !user.IsGlobalAdmin() && permission.Owner != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized tenant operation: %s", permission.Owner))
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddPermission(&permission))
	c.ServeJSON()
}

// DeletePermission
// @Title DeletePermission
// @Tag Permission API
// @Description delete permission
// @Param   body    body   object.Permission  true        "The details of the permission"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-permission [post]
func (c *ApiController) DeletePermission() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var permission object.Permission
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &permission)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	if !user.IsGlobalAdmin() && permission.Owner != user.Owner {
		c.ResponseError(fmt.Sprintf("unauthorized tenant operation: %s", permission.Owner))
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeletePermission(&permission))
	c.ServeJSON()
}

// CheckFeature
// @Title CheckFeature
// @Tag Permission API
// @Description check one feature permission for current tenant
// @Param   body    body   controllers.FeatureCheckRequest  true        "The feature check request"
// @Success 200 {object} controllers.Response The Response object
// @router /authz/check-feature [post]
func (c *ApiController) CheckFeature() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var req FeatureCheckRequest
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

	resource := normalizeFeaturePath(req.Resource)
	if resource == "" {
		c.ResponseError("resource is required")
		return
	}

	method := normalizeActionToMethod(req.Action)
	allowed, err := object.CheckApiPermission(subject, tenant, resource, method)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(map[string]interface{}{
		"allowed":       allowed,
		"reason":        "",
		"matchedPolicy": "api-permission",
		"traceId":       util.GetRandomName(),
	})
}

// CheckFeatureBatch
// @Title CheckFeatureBatch
// @Tag Permission API
// @Description check batch feature permissions for current tenant
// @Param   body    body   controllers.FeatureBatchCheckRequest  true        "The feature batch check request"
// @Success 200 {object} controllers.Response The Response object
// @router /authz/check-feature-batch [post]
func (c *ApiController) CheckFeatureBatch() {
	user, ok := c.RequireSignedInUser()
	if !ok {
		return
	}

	var req FeatureBatchCheckRequest
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

	results := make([]map[string]interface{}, 0, len(req.Checks))
	for _, item := range req.Checks {
		subject := item.Subject
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

		resource := normalizeFeaturePath(item.Resource)
		if resource == "" {
			c.ResponseError("resource is required")
			return
		}

		method := normalizeActionToMethod(item.Action)
		allowed, err := object.CheckApiPermission(subject, tenant, resource, method)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		results = append(results, map[string]interface{}{
			"subject":       subject,
			"resource":      resource,
			"action":        method,
			"allowed":       allowed,
			"matchedPolicy": "api-permission",
		})
	}

	c.ResponseOk(map[string]interface{}{
		"results": results,
		"traceId": util.GetRandomName(),
	})
}

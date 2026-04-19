// Copyright 2024 The Casdoor Authors. All Rights Reserved.
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

	"github.com/beego/beego/v2/core/utils/pagination"
	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/util"
)

// GetDepartments
// @Title GetDepartments
// @Tag Department API
// @Description get departments
// @Param   owner     query    string  true        "The owner of departments"
// @Success 200 {array} object.Department The Response object
// @router /get-departments [get]
func (c *ApiController) GetDepartments() {
	owner := c.Ctx.Input.Query("owner")
	limit := c.Ctx.Input.Query("pageSize")
	page := c.Ctx.Input.Query("p")
	field := c.Ctx.Input.Query("field")
	value := c.Ctx.Input.Query("value")
	sortField := c.Ctx.Input.Query("sortField")
	sortOrder := c.Ctx.Input.Query("sortOrder")
	withTree := c.Ctx.Input.Query("withTree")

	if limit == "" || page == "" {
		departments, err := object.GetDepartments(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		if withTree == "true" {
			c.ResponseOk(object.BuildDepartmentTree(departments))
			return
		}

		c.ResponseOk(departments)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetDepartmentCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.NewPaginator(c.Ctx.Request, limit, count)
		departments, err := object.GetPaginationDepartments(owner, paginator.Offset(), limit, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(departments, paginator.Nums())
	}
}

// GetDepartment
// @Title GetDepartment
// @Tag Department API
// @Description get department
// @Param   id     query    string  true        "The id ( owner/name ) of the department"
// @Success 200 {object} object.Department The Response object
// @router /get-department [get]
func (c *ApiController) GetDepartment() {
	id := c.Ctx.Input.Query("id")

	department, err := object.GetDepartment(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(department)
}

// UpdateDepartment
// @Title UpdateDepartment
// @Tag Department API
// @Description update department
// @Param   id     query    string  true        "The id ( owner/name ) of the department"
// @Param   body    body   object.Department  true        "The details of the department"
// @Success 200 {object} controllers.Response The Response object
// @router /update-department [post]
func (c *ApiController) UpdateDepartment() {
	id := c.Ctx.Input.Query("id")

	var department object.Department
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &department)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateDepartment(id, &department))
	c.ServeJSON()
}

// AddDepartment
// @Title AddDepartment
// @Tag Department API
// @Description add department
// @Param   body    body   object.Department  true      "The details of the department"
// @Success 200 {object} controllers.Response The Response object
// @router /add-department [post]
func (c *ApiController) AddDepartment() {
	var department object.Department
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &department)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddDepartment(&department))
	c.ServeJSON()
}

// DeleteDepartment
// @Title DeleteDepartment
// @Tag Department API
// @Description delete department
// @Param   body    body   object.Department  true        "The details of the department"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-department [post]
func (c *ApiController) DeleteDepartment() {
	var department object.Department
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &department)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteDepartment(&department))
	c.ServeJSON()
}

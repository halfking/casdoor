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

	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/util"
)

// GetWorkflows 获取工作流列表
// @Title GetWorkflows
// @Tag Workflow API
// @Description get workflows, optionally filtered by department
// @Param   department  query    string  false       "The department name"
// @Success 200 {array} object.Workflow
// @router /get-workflows [get]
func (c *ApiController) GetWorkflows() {
	dept := c.Ctx.Input.Query("department")
	var workflows []*object.Workflow
	var err error
	if dept != "" {
		workflows, err = object.GetWorkflowsByDepartment(dept)
	} else {
		workflows, err = object.GetWorkflows()
	}
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(workflows)
}

// GetWorkflow 获取单个工作流
// @Title GetWorkflow
// @Tag Workflow API
// @Description get workflow by id
// @Param   id     query    int  true        "The id"
// @Success 200 {object} object.Workflow
// @router /get-workflow [get]
func (c *ApiController) GetWorkflow() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	wf, err := object.GetWorkflow(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(wf)
}

// PostWorkflow 创建工作流
// @Title PostWorkflow
// @Tag Workflow API
// @Description create a new workflow
// @Success 200 {bool} success
// @router /add-workflow [post]
func (c *ApiController) PostWorkflow() {
	var wf object.Workflow
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &wf); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.AddWorkflow(&wf)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// PutWorkflow 更新工作流
// @Title PutWorkflow
// @Tag Workflow API
// @Description update workflow
// @Success 200 {bool} success
// @router /update-workflow [put]
func (c *ApiController) PutWorkflow() {
	var wf object.Workflow
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &wf); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.UpdateWorkflow(&wf)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// DeleteWorkflow 删除工作流
// @Title DeleteWorkflow
// @Tag Workflow API
// @Description delete workflow
// @Param   id     query    int  true        "The id"
// @Success 200 {bool} success
// @router /delete-workflow [delete]
func (c *ApiController) DeleteWorkflow() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	affected, err := object.DeleteWorkflow(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

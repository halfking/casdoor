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

// GetWorkflowExecutions 获取工作流执行记录列表
// @Title GetWorkflowExecutions
// @Tag Workflow Execution API
// @Description get workflow executions, optionally filtered by applicant
// @Param   applicant  query    string  false       "The applicant name"
// @Success 200 {array} object.WorkflowExecution
// @router /get-workflow-executions [get]
func (c *ApiController) GetWorkflowExecutions() {
	applicant := c.Ctx.Input.Query("applicant")
	var executions []*object.WorkflowExecution
	var err error
	if applicant != "" {
		executions, err = object.GetWorkflowExecutionsByApplicant(applicant)
	} else {
		executions, err = object.GetWorkflowExecutions()
	}
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(executions)
}

// GetWorkflowExecution 获取单个工作流执行记录
// @Title GetWorkflowExecution
// @Tag Workflow Execution API
// @Description get workflow execution by id
// @Param   id     query    int  true        "The id"
// @Success 200 {object} object.WorkflowExecution
// @router /get-workflow-execution [get]
func (c *ApiController) GetWorkflowExecution() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	ex, err := object.GetWorkflowExecution(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(ex)
}

// PostWorkflowExecution 发起工作流执行
// @Title PostWorkflowExecution
// @Tag Workflow Execution API
// @Description create a new workflow execution
// @Success 200 {bool} success
// @router /add-workflow-execution [post]
func (c *ApiController) PostWorkflowExecution() {
	var ex object.WorkflowExecution
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &ex); err != nil {
		c.ResponseError(err.Error())
		return
	}
	if ex.Status == "" {
		ex.Status = "pending"
	}
	ex.CurrentStep = 0
	affected, err := object.AddWorkflowExecution(&ex)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// PutWorkflowExecution 更新工作流执行记录
// @Title PutWorkflowExecution
// @Tag Workflow Execution API
// @Description update workflow execution (approve/reject)
// @Success 200 {bool} success
// @router /update-workflow-execution [put]
func (c *ApiController) PutWorkflowExecution() {
	var ex object.WorkflowExecution
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &ex); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.UpdateWorkflowExecution(&ex)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

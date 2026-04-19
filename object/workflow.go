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

package object

import (
	"github.com/casdoor/casdoor/util"
	"github.com/xorm-io/core"
)

type Workflow struct {
	Id           int    `xorm:"int pk autoincr" json:"id"`
	Owner        string `xorm:"varchar(100)" json:"owner"`
	Name         string `xorm:"varchar(100)" json:"name"`
	DisplayName  string `xorm:"varchar(100)" json:"displayName"`
	Description  string `xorm:"text" json:"description"`
	Department   string `xorm:"varchar(100)" json:"department"`
	Steps        string `xorm:"text" json:"steps"`
	IsTemplate   bool   `xorm:"bool" json:"isTemplate"` // is_template
	Version      int    `xorm:"int" json:"version"`
	Metadata     string `xorm:"text" json:"metadata"`
	CreatedTime  string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime  string `xorm:"varchar(100)" json:"updatedTime"`
}

type WorkflowExecution struct {
	Id           int    `xorm:"int pk autoincr" json:"id"`
	WorkflowId   int    `xorm:"int" json:"workflowId"`
	TaskId       string `xorm:"varchar(100)" json:"taskId"`
	Status       string `xorm:"varchar(20)" json:"status"` // pending/approved/rejected
	CurrentStep  int    `xorm:"int" json:"currentStep"`
	Context      string `xorm:"text" json:"context"`
	StartedAt    string `xorm:"-" json:"startedAt"`
	CompletedAt  string `xorm:"-" json:"completedAt"`
	ErrorMessage string `xorm:"text" json:"errorMessage"`
	CreatedTime  string `xorm:"varchar(100)" json:"createdTime"`
}

// Workflow methods

func GetWorkflows() ([]*Workflow, error) {
	workflows := []*Workflow{}
	err := ormer.Engine.Desc("id").Find(&workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

func GetWorkflow(id int) (*Workflow, error) {
	workflow := &Workflow{Id: id}
	existed, err := ormer.Engine.Get(workflow)
	if err != nil {
		return nil, err
	}
	if existed {
		return workflow, nil
	}
	return nil, nil
}

func GetWorkflowsByOwner(owner string) ([]*Workflow, error) {
	workflows := []*Workflow{}
	err := ormer.Engine.Where("owner = ?", owner).Desc("id").Find(&workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

func GetWorkflowsByDepartment(department string) ([]*Workflow, error) {
	workflows := []*Workflow{}
	err := ormer.Engine.Where("department = ?", department).Desc("id").Find(&workflows)
	if err != nil {
		return nil, err
	}
	return workflows, nil
}

func AddWorkflow(wf *Workflow) (bool, error) {
	if wf.Owner == "" {
		wf.Owner = "built-in"
	}
	if wf.Version == 0 {
		wf.Version = 1
	}
	now := util.GetCurrentTime()
	if wf.CreatedTime == "" {
		wf.CreatedTime = now
	}
	wf.UpdatedTime = now
	affected, err := ormer.Engine.Insert(wf)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func UpdateWorkflow(wf *Workflow) (bool, error) {
	wf.UpdatedTime = util.GetCurrentTime()
	affected, err := ormer.Engine.ID(core.PK{wf.Id}).AllCols().Update(wf)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteWorkflow(id int) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{id}).Delete(&Workflow{})
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

// WorkflowExecution methods

func GetWorkflowExecutions() ([]*WorkflowExecution, error) {
	executions := []*WorkflowExecution{}
	err := ormer.Engine.Desc("id").Find(&executions)
	if err != nil {
		return nil, err
	}
	return executions, nil
}

func GetWorkflowExecution(id int) (*WorkflowExecution, error) {
	execution := &WorkflowExecution{Id: id}
	existed, err := ormer.Engine.Get(execution)
	if err != nil {
		return nil, err
	}
	if existed {
		return execution, nil
	}
	return nil, nil
}

func GetWorkflowExecutionsByWorkflow(workflowId int) ([]*WorkflowExecution, error) {
	executions := []*WorkflowExecution{}
	err := ormer.Engine.Where("workflow_id = ?", workflowId).Desc("id").Find(&executions)
	if err != nil {
		return nil, err
	}
	return executions, nil
}

func GetWorkflowExecutionsByApplicant(applicant string) ([]*WorkflowExecution, error) {
	executions := []*WorkflowExecution{}
	err := ormer.Engine.Where("applicant = ?", applicant).Desc("id").Find(&executions)
	if err != nil {
		return nil, err
	}
	return executions, nil
}

func AddWorkflowExecution(ex *WorkflowExecution) (bool, error) {
	if ex.CreatedTime == "" {
		ex.CreatedTime = util.GetCurrentTime()
	}
	affected, err := ormer.Engine.Insert(ex)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func UpdateWorkflowExecution(ex *WorkflowExecution) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{ex.Id}).AllCols().Update(ex)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

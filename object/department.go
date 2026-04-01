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
	"fmt"

	"github.com/casdoor/casdoor/util"
	"github.com/xorm-io/core"
)

type Department struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`

	DisplayName string `xorm:"varchar(100)" json:"displayName"`
	Description string `xorm:"varchar(200)" json:"description"`
	ParentId    string `xorm:"varchar(100)" json:"parentId"`
	Code        string `xorm:"varchar(50)" json:"code"`
	Level       int    `json:"level"`
	SortOrder   int    `json:"sortOrder"`
	Leader      string `xorm:"varchar(100)" json:"leader"`
	IsEnabled   bool   `json:"isEnabled"`

	Children []*Department `xorm:"-" json:"children,omitempty"`
}

func (d *Department) GetId() string {
	return fmt.Sprintf("%s/%s", d.Owner, d.Name)
}

func GetDepartmentCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Department{})
}

func GetDepartments(owner string) ([]*Department, error) {
	departments := []*Department{}
	err := ormer.Engine.Desc("created_time").Find(&departments, &Department{Owner: owner})
	if err != nil {
		return nil, err
	}
	return departments, nil
}

func GetPaginationDepartments(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Department, error) {
	departments := []*Department{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&departments)
	if err != nil {
		return nil, err
	}
	return departments, nil
}

func getDepartment(owner string, name string) (*Department, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	department := Department{Owner: owner, Name: name}
	existed, err := ormer.Engine.Get(&department)
	if err != nil {
		return nil, err
	}
	if existed {
		return &department, nil
	}
	return nil, nil
}

func GetDepartment(id string) (*Department, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return nil, err
	}
	return getDepartment(owner, name)
}

func UpdateDepartment(id string, department *Department) (bool, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return false, err
	}
	oldDepartment, err := getDepartment(owner, name)
	if oldDepartment == nil {
		return false, err
	}

	affected, err := ormer.Engine.ID(core.PK{owner, name}).AllCols().Update(department)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddDepartment(department *Department) (bool, error) {
	affected, err := ormer.Engine.Insert(department)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddDepartments(departments []*Department) (bool, error) {
	if len(departments) == 0 {
		return false, nil
	}
	affected, err := ormer.Engine.Insert(departments)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteDepartment(department *Department) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{department.Owner, department.Name}).Delete(&Department{})
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func BuildDepartmentTree(departments []*Department) []*Department {
	deptMap := make(map[string]*Department)
	var roots []*Department

	for _, d := range departments {
		deptMap[d.Name] = d
	}

	for _, d := range departments {
		if d.ParentId == "" {
			roots = append(roots, d)
		} else {
			parent, ok := deptMap[d.ParentId]
			if ok {
				parent.Children = append(parent.Children, d)
			} else {
				roots = append(roots, d)
			}
		}
	}
	return roots
}

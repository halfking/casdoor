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

// Position 对应数据库表 position_detail
// 注意：DB列名与API JSON字段名不同，xorm tag写实际列名
type Position struct {
	Id             int    `xorm:"int pk autoincr" json:"id"`
	RoleOwner      string `xorm:"column(role_owner) varchar(100)" json:"roleOwner"`
	RoleName       string `xorm:"column(role_name) varchar(100)" json:"roleName"`
	FullDescription string `xorm:"column(full_description) text" json:"fullDescription"`
	Skills         string `xorm:"-" json:"skills"`           // text[]，序列化存储
	Requirements   string `xorm:"column(requirements) text" json:"requirements"`
	SystemPrompt   string `xorm:"column(system_prompt) text" json:"systemPrompt"`
	Department     string `xorm:"column(department) varchar(100)" json:"department"`
	ReportsTo      string `xorm:"column(reports_to) varchar(100)" json:"reportsTo"`
	ImpliedRole    string `xorm:"column(implied_role) varchar(100)" json:"impliedRole"` // 引用的 Casdoor Role (owner/name)
	Metadata       string `xorm:"-" json:"metadata"`         // jsonb，跳过
	CreatedAt      string `xorm:"-" json:"createdAt"`
	UpdatedAt      string `xorm:"-" json:"updatedAt"`
}

// TableName 返回实际的表名
func (p *Position) TableName() string {
	return "position_detail"
}

// GetPositions 获取所有岗位
func GetPositions() ([]*Position, error) {
	positions := []*Position{}
	err := ormer.Engine.Desc("id").Find(&positions)
	if err != nil {
		return nil, err
	}
	return positions, nil
}

// GetPosition 获取单个岗位
func GetPosition(id int) (*Position, error) {
	position := &Position{Id: id}
	existed, err := ormer.Engine.Get(position)
	if err != nil {
		return nil, err
	}
	if existed {
		return position, nil
	}
	return nil, nil
}

// GetPositionsByDept 根据部门名获取岗位
func GetPositionsByDept(department string) ([]*Position, error) {
	positions := []*Position{}
	err := ormer.Engine.Where("department = ?", department).Desc("id").Find(&positions)
	if err != nil {
		return nil, err
	}
	return positions, nil
}

// GetPositionsByOwner 根据 role_owner 获取岗位
func GetPositionsByOwner(roleOwner string) ([]*Position, error) {
	positions := []*Position{}
	err := ormer.Engine.Where("role_owner = ?", roleOwner).Desc("id").Find(&positions)
	if err != nil {
		return nil, err
	}
	return positions, nil
}

// AddPosition 添加岗位
func AddPosition(pos *Position) (bool, error) {
	if pos.RoleOwner == "" {
		pos.RoleOwner = "kaixuan"
	}
	affected, err := ormer.Engine.Insert(pos)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

// UpdatePosition 更新岗位
func UpdatePosition(pos *Position) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{pos.Id}).AllCols().Update(pos)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

// DeletePosition 删除岗位
func DeletePosition(id int) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{id}).Delete(&Position{})
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

// AssignPosition 将岗位的 impliedRole 分配给用户（添加 Role 到 User）
// action = "add" 或 "delete"
func AssignPosition(positionId int, userName string, action string) (bool, error) {
	// 1. 获取岗位信息
	pos, err := GetPosition(positionId)
	if err != nil {
		return false, err
	}
	if pos == nil {
		return false, fmt.Errorf("position not found")
	}
	if pos.ImpliedRole == "" {
		return false, fmt.Errorf("position has no implied role")
	}

	// 2. 获取用户
	userId := util.GetId("kaixuan", userName)
	user, err := GetUser(userId)
	if err != nil {
		return false, err
	}
	if user == nil {
		return false, fmt.Errorf("user not found")
	}

	// 3. 解析 role 的 owner/name
	roleId := pos.ImpliedRole // 格式可能是 "kaixuan/dept-tech-cto"

	if action == "add" {
		// 4. 添加 Role 到 User: 在 Role.Users 中添加 userId
		role, err := GetRole(roleId)
		if err != nil {
			return false, err
		}
		if role == nil {
			return false, fmt.Errorf("role %s not found", roleId)
		}

		// 检查是否已经分配（幂等）
		if !util.InSlice(role.Users, userId) {
			role.Users = append(role.Users, userId)
			_, err = ormer.Engine.ID(core.PK{role.Owner, role.Name}).Cols("users").Update(role)
			if err != nil {
				return false, err
			}
		}
		return true, nil
	} else if action == "delete" {
		// 4. 从 User 删除 Role: 从 Role.Users 中移除 userId
		role, err := GetRole(roleId)
		if err != nil {
			return false, err
		}
		if role == nil {
			return false, fmt.Errorf("role %s not found", roleId)
		}

		// 检查是否存在
		if util.InSlice(role.Users, userId) {
			role.Users = util.DeleteVal(role.Users, userId)
			_, err = ormer.Engine.ID(core.PK{role.Owner, role.Name}).Cols("users").Update(role)
			if err != nil {
				return false, err
			}
		}
		return true, nil
	} else {
		return false, fmt.Errorf("invalid action: %s", action)
	}
}

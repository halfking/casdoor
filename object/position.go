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

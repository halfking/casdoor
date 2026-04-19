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
	Id              int    `xorm:"int pk autoincr" json:"id"`
	RoleOwner       string `xorm:"'role_owner' varchar(100)" json:"roleOwner"`
	RoleName        string `xorm:"'role_name' varchar(100)" json:"roleName"`
	Code            string `xorm:"'code' varchar(50)" json:"code"` // 编码，用于与 Post.code 匹配
	FullDescription string `xorm:"'full_description' text" json:"fullDescription"`
	Skills          string `xorm:"-" json:"skills"`                // text[]，序列化存储
	Requirements    string `xorm:"'requirements' text" json:"requirements"`
	SystemPrompt    string `xorm:"'system_prompt' text" json:"systemPrompt"`
	Department      string `xorm:"'department' varchar(100)" json:"department"`
	ReportsTo       string `xorm:"'reports_to' varchar(100)" json:"reportsTo"`
	ImpliedRole     string `xorm:"'implied_role' varchar(100)" json:"impliedRole"` // 引用的 Casdoor Role (owner/name)
	OrgTreeCode     string `xorm:"'org_tree_code' varchar(100)" json:"orgTreeCode"` // 关联的组织树节点编码
	AgentProvider   string `xorm:"'agent_provider' varchar(100)" json:"agentProvider"` // 关联的 AI Provider
	AgentModel      string `xorm:"'agent_model' varchar(100)" json:"agentModel"`       // 关联的 AI Model
	Metadata        string `xorm:"-" json:"metadata"`              // jsonb，跳过
	CreatedAt       string `xorm:"-" json:"createdAt"`
	UpdatedAt       string `xorm:"-" json:"updatedAt"`
}

// OrgTreeRef 组织树引用信息
type OrgTreeRef struct {
	Id          int    `json:"id"`
	DisplayName string `json:"displayName"`
	TenantId    string `json:"tenantId"`
	OrgType     string `json:"orgType"`
}

// AgentMatch AI 智能体匹配信息
type AgentMatch struct {
	ProviderId   string `json:"providerId"`
	ProviderName string `json:"providerName"`
	ModelName    string `json:"modelName"`
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
		pos.RoleOwner = "built-in"
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

// GetOrgTreeRefsByPosition 获取引用指定岗位的组织树节点列表
func GetOrgTreeRefsByPosition(positionCode string) ([]*OrgTreeRef, error) {
	if positionCode == "" {
		return []*OrgTreeRef{}, nil
	}
	nodes := []*OrgTree{}
	err := ormer.Engine.Where("code = ?", positionCode).Find(&nodes)
	if err != nil {
		return nil, err
	}
	refs := make([]*OrgTreeRef, 0, len(nodes))
	for _, node := range nodes {
		refs = append(refs, &OrgTreeRef{
			Id:          node.Id,
			DisplayName: node.DisplayName,
			TenantId:    node.TenantId,
			OrgType:     node.OrgType,
		})
	}
	return refs, nil
}

// GetAgentMatchesByPosition 获取与指定岗位匹配的 AI 智能体信息
func GetAgentMatchesByPosition(providerId string, modelName string) ([]*AgentMatch, error) {
	if providerId == "" {
		return []*AgentMatch{}, nil
	}
	// 直接使用 providerId 作为显示名称（实际生产中应该查询 Provider 表获取详细信息）
	matches := []*AgentMatch{
		{
			ProviderId:   providerId,
			ProviderName: providerId,
			ModelName:    modelName,
		},
	}
	return matches, nil
}

// GetPositionsByOrgTree 获取指定组织树节点下的所有岗位
func GetPositionsByOrgTree(orgTreeCode string) ([]*Position, error) {
	if orgTreeCode == "" {
		return []*Position{}, nil
	}
	positions := []*Position{}
	err := ormer.Engine.Where("org_tree_code = ?", orgTreeCode).Desc("id").Find(&positions)
	if err != nil {
		return nil, err
	}
	return positions, nil
}

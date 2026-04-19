// Copyright 2024 The kxpms Authors. All Rights Reserved.
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

import "github.com/xorm-io/core"

// OrganizationExt 组织扩展模型
// kxpms自定义扩展，用于支持多层组织、条块管理、多租户等特性
type OrganizationExt struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`

	// 多租户扩展
	TenantId     string `xorm:"varchar(100)" json:"tenantId"`     // 租户ID
	TenantName   string `xorm:"varchar(100)" json:"tenantName"`   // 租户名称
	TenantStatus int    `xorm:"int" json:"tenantStatus"`          // 租户状态：0-禁用 1-启用
	TenantLevel  int    `xorm:"int" json:"tenantLevel"`           // 租户层级：1-平台级 2-租户级 3-项目级

	// 组织架构扩展
	ParentId   string `xorm:"varchar(100)" json:"parentId"`   // 上级组织ID
	OrgPath    string `xorm:"varchar(500)" json:"orgPath"`    // 组织路径，如：/root/org1/org2
	OrgLevel   int    `xorm:"int" json:"orgLevel"`            // 组织层级
	OrgSort    int    `xorm:"int" json:"orgSort"`             // 排序号
	OrgType    string `xorm:"varchar(50)" json:"orgType"`     // 组织类型：company-公司 department-部门 group-小组 project-项目

	// 条块管理扩展
	IsBlock    bool   `xorm:"bool" json:"isBlock"`           // 是否为条线管理组织
	BlockCode  string `xorm:"varchar(50)" json:"blockCode"`  // 条线编码
	BlockName  string `xorm:"varchar(100)" json:"blockName"` // 条线名称
	BlockLevel int    `xorm:"int" json:"blockLevel"`         // 条线层级

	// 岗位管理扩展
	EnablePostManagement bool `xorm:"bool" json:"enablePostManagement"` // 是否启用岗位管理
	PostLevelCount       int  `xorm:"int" json:"postLevelCount"`        // 岗位层级数量

	// 扩展属性
	ExtData map[string]interface{} `xorm:"json" json:"extData"` // 扩展数据
}

// GetOrganizationExt 获取组织扩展信息
func GetOrganizationExt(owner, name string) (*OrganizationExt, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	ext := OrganizationExt{Owner: owner, Name: name}
	existed, err := ormer.Engine.Get(&ext)
	if err != nil {
		return nil, err
	}

	if existed {
		return &ext, nil
	}

	// 不存在则返回默认扩展
	return &OrganizationExt{
		Owner:                owner,
		Name:                 name,
		TenantStatus:         1,
		EnablePostManagement: true,
	}, nil
}

// UpdateOrganizationExt 更新组织扩展信息
func UpdateOrganizationExt(owner, name string, ext *OrganizationExt) (bool, error) {
	if owner == "" || name == "" {
		return false, nil
	}

	ext.Owner = owner
	ext.Name = name

	existing, err := GetOrganizationExt(owner, name)
	if err != nil {
		return false, err
	}

	if existing == nil {
		// 新增
		_, err = ormer.Engine.Insert(ext)
		if err != nil {
			return false, err
		}
		return true, nil
	}

	// 更新
	_, err = ormer.Engine.ID(core.PK{owner, name}).Update(ext)
	if err != nil {
		return false, err
	}
	return true, nil
}

// DeleteOrganizationExt 删除组织扩展信息
func DeleteOrganizationExt(owner, name string) (bool, error) {
	if owner == "" || name == "" {
		return false, nil
	}

	_, err := ormer.Engine.ID(core.PK{owner, name}).Delete(&OrganizationExt{})
	if err != nil {
		return false, err
	}
	return true, nil
}

// GetOrganizationsByTenantId 根据租户ID获取组织列表
func GetOrganizationsByTenantId(tenantId string) ([]*OrganizationExt, error) {
	var exts []*OrganizationExt
	err := ormer.Engine.Where("tenant_id = ?", tenantId).Find(&exts)
	if err != nil {
		return nil, err
	}
	return exts, nil
}

// GetSubOrganizations 获取子组织列表
func GetSubOrganizations(owner, parentId string) ([]*OrganizationExt, error) {
	var exts []*OrganizationExt
	err := ormer.Engine.Where("owner = ? AND parent_id = ?", owner, parentId).Find(&exts)
	if err != nil {
		return nil, err
	}
	return exts, nil
}

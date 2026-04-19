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

// UserExt 用户扩展模型
// kxpms自定义扩展，用于支持岗位管理、数据权限、条块归属等特性
type UserExt struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(255) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`

	// 岗位信息
	PostId      string `xorm:"varchar(100)" json:"postId"`      // 岗位ID
	PostName    string `xorm:"varchar(100)" json:"postName"`    // 岗位名称
	PostLevel   int    `xorm:"int" json:"postLevel"`            // 岗位层级
	PostCode    string `xorm:"varchar(50)" json:"postCode"`     // 岗位编码
	PostStatus  int    `xorm:"int" json:"postStatus"`           // 岗位状态：0-禁用 1-启用

	// 组织归属
	MainOrgId   string `xorm:"varchar(100)" json:"mainOrgId"`   // 主组织ID
	MainOrgName string `xorm:"varchar(100)" json:"mainOrgName"` // 主组织名称
	MainDeptId  string `xorm:"varchar(100)" json:"mainDeptId"`  // 主部门ID
	MainDeptName string `xorm:"varchar(100)" json:"mainDeptName"`// 主部门名称

	// 条块管理
	BlockId     string `xorm:"varchar(100)" json:"blockId"`     // 条线ID
	BlockName   string `xorm:"varchar(100)" json:"blockName"`   // 条线名称
	BlockCode   string `xorm:"varchar(50)" json:"blockCode"`    // 条线编码
	IsBlockAdmin bool   `xorm:"bool" json:"isBlockAdmin"`       // 是否为条线管理员

	// 多租户信息
	TenantId    string `xorm:"varchar(100)" json:"tenantId"`    // 租户ID
	TenantName  string `xorm:"varchar(100)" json:"tenantName"`  // 租户名称
	IsTenantAdmin bool  `xorm:"bool" json:"isTenantAdmin"`      // 是否为租户管理员

	// 数据权限配置
	DataPermissionType string `xorm:"varchar(50)" json:"dataPermissionType"` // 数据权限类型：all-全部 tenant-租户级 org-组织级 dept-部门级 personal-个人级 custom-自定义
	DataPermissionScope []string `xorm:"mediumtext" json:"dataPermissionScope"` // 数据权限范围（组织ID列表）
	EnableDataPermission bool `xorm:"bool" json:"enableDataPermission"` // 是否启用数据权限控制

	// 管理范围
	ManagedOrgIds  []string `xorm:"mediumtext" json:"managedOrgIds"`  // 可管理的组织ID列表
	ManagedDeptIds []string `xorm:"mediumtext" json:"managedDeptIds"` // 可管理的部门ID列表
	ManagedPostIds []string `xorm:"mediumtext" json:"managedPostIds"` // 可管理的岗位ID列表

	// 扩展属性
	ExtData map[string]interface{} `xorm:"json" json:"extData"` // 扩展数据
}

// GetUserExt 获取用户扩展信息
func GetUserExt(owner, name string) (*UserExt, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	ext := UserExt{Owner: owner, Name: name}
	existed, err := ormer.Engine.Get(&ext)
	if err != nil {
		return nil, err
	}

	if existed {
		return &ext, nil
	}

	// 不存在则返回默认扩展
	return &UserExt{
		Owner:                owner,
		Name:                 name,
		PostStatus:           1,
		EnableDataPermission: true,
		DataPermissionType:   "personal",
	}, nil
}

// UpdateUserExt 更新用户扩展信息
func UpdateUserExt(owner, name string, ext *UserExt) (bool, error) {
	if owner == "" || name == "" {
		return false, nil
	}

	ext.Owner = owner
	ext.Name = name

	existing, err := GetUserExt(owner, name)
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

// DeleteUserExt 删除用户扩展信息
func DeleteUserExt(owner, name string) (bool, error) {
	if owner == "" || name == "" {
		return false, nil
	}

	_, err := ormer.Engine.ID(core.PK{owner, name}).Delete(&UserExt{})
	if err != nil {
		return false, err
	}
	return true, nil
}

// GetUsersByPostId 根据岗位ID获取用户列表
func GetUsersByPostId(postId string) ([]*UserExt, error) {
	var exts []*UserExt
	err := ormer.Engine.Where("post_id = ?", postId).Find(&exts)
	if err != nil {
		return nil, err
	}
	return exts, nil
}

// GetUsersByOrgId 根据组织ID获取用户列表
func GetUsersByOrgId(orgId string) ([]*UserExt, error) {
	var exts []*UserExt
	err := ormer.Engine.Where("main_org_id = ? OR main_dept_id = ?", orgId, orgId).Find(&exts)
	if err != nil {
		return nil, err
	}
	return exts, nil
}

// GetUsersByBlockId 根据条线ID获取用户列表
func GetUsersByBlockId(blockId string) ([]*UserExt, error) {
	var exts []*UserExt
	err := ormer.Engine.Where("block_id = ?", blockId).Find(&exts)
	if err != nil {
		return nil, err
	}
	return exts, nil
}

// GetUsersByTenantId 根据租户ID获取用户列表
func GetUsersByTenantId(tenantId string) ([]*UserExt, error) {
	var exts []*UserExt
	err := ormer.Engine.Where("tenant_id = ?", tenantId).Find(&exts)
	if err != nil {
		return nil, err
	}
	return exts, nil
}

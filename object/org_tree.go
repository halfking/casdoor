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
	"time"

	"github.com/xorm-io/core"
)

type OrgTree struct {
	Id             int     `xorm:"int pk autoincr" json:"id"`
	ParentId       int     `xorm:"int" json:"parentId"`
	OrgName        string  `xorm:"varchar(100)" json:"orgName"`
	DisplayName    string  `xorm:"varchar(100)" json:"displayName"`
	OrgType        string  `xorm:"varchar(20)" json:"orgType"`
	Level          int     `xorm:"int" json:"level"`
	SortOrder      int     `xorm:"int" json:"sortOrder"`
	CasdoorOrgName string  `xorm:"varchar(100)" json:"casdoorOrgName"`
	Metadata       string  `xorm:"-" json:"metadata"` // jsonb, handled separately if needed
	CreatedAt      string  `xorm:"-" json:"createdAt"`
	UpdatedAt      string  `xorm:"-" json:"updatedAt"`
}

// TableName 返回实际的表名
func (o *OrgTree) TableName() string {
	return "org_tree"
}

func GetOrgTreeNodes() ([]*OrgTree, error) {
	nodes := []*OrgTree{}
	err := ormer.Engine.Asc("sort_order").Find(&nodes)
	if err != nil {
		return nil, err
	}
	return nodes, nil
}

func GetOrgTreeNode(id int) (*OrgTree, error) {
	node := &OrgTree{Id: id}
	existed, err := ormer.Engine.Get(node)
	if err != nil {
		return nil, err
	}
	if existed {
		return node, nil
	}
	return nil, nil
}

func AddOrgTreeNode(node *OrgTree) (bool, error) {
	if node.OrgName == "" {
		node.OrgName = fmt.Sprintf("org_%d", time.Now().UnixNano())
	}
	if node.CasdoorOrgName == "" {
		node.CasdoorOrgName = "kaixuan"
	}
	affected, err := ormer.Engine.Insert(node)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func UpdateOrgTreeNode(node *OrgTree) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{node.Id}).AllCols().Update(node)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteOrgTreeNode(id int) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{id}).Delete(&OrgTree{})
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func GetOrgTreeChildren(parentId int) ([]*OrgTree, error) {
	nodes := []*OrgTree{}
	err := ormer.Engine.Where("parent_id = ?", parentId).Asc("sort_order").Find(&nodes)
	if err != nil {
		return nil, err
	}
	return nodes, nil
}

func GetOrgTreeRoot() ([]*OrgTree, error) {
	nodes := []*OrgTree{}
	err := ormer.Engine.Where("parent_id = 0").Asc("sort_order").Find(&nodes)
	if err != nil {
		return nil, err
	}
	return nodes, nil
}

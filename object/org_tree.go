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
	"strconv"
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
	Code           string  `xorm:"varchar(50)" json:"code"`            // 编码，用于与 Department.code 匹配
	Leader         string  `xorm:"varchar(100)" json:"leader"`        // 负责人
	TenantId       string  `xorm:"varchar(100)" json:"tenantId"`      // 租户ID，用于多租户隔离
	Metadata       string  `xorm:"-" json:"metadata"`                 // jsonb, handled separately if needed
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
	if node.TenantId == "" {
		node.TenantId = node.CasdoorOrgName
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

// GetOrgTreeNodesByTenant 根据租户ID获取所有组织树节点
func GetOrgTreeNodesByTenant(tenantId string) ([]*OrgTree, error) {
	nodes := []*OrgTree{}
	err := ormer.Engine.Where("tenant_id = ?", tenantId).Asc("sort_order").Find(&nodes)
	if err != nil {
		return nil, err
	}
	return nodes, nil
}

// GetOrgTreeRootByTenant 根据租户ID获取根节点
func GetOrgTreeRootByTenant(tenantId string) ([]*OrgTree, error) {
	nodes := []*OrgTree{}
	err := ormer.Engine.Where("parent_id = 0 AND tenant_id = ?", tenantId).Asc("sort_order").Find(&nodes)
	if err != nil {
		return nil, err
	}
	return nodes, nil
}

// GetTenantList 获取所有租户列表（从 tenant 表读取）
func GetTenantList() ([]string, error) {
	tenants, err := GetTenants()
	if err != nil {
		return nil, err
	}
	tenantIds := make([]string, 0, len(tenants))
	for _, t := range tenants {
		if t.TenantId != "" {
			tenantIds = append(tenantIds, t.TenantId)
		}
	}
	return tenantIds, nil
}

// GetTenantDisplayNames 获取租户及其显示名称的映射
func GetTenantDisplayNames() (map[string]string, error) {
	type result struct {
		TenantId       string
		CasdoorOrgName string
	}
	tenants := []result{}
	err := ormer.Engine.Table("org_tree").Select("DISTINCT tenant_id, casdoor_org_name").Find(&tenants)
	if err != nil {
		return nil, err
	}
	tenantMap := make(map[string]string)
	for _, t := range tenants {
		if t.TenantId != "" {
			tenantMap[t.TenantId] = t.CasdoorOrgName
		}
	}
	return tenantMap, nil
}

// OrgTreeTemplateNode 模板节点结构
type OrgTreeTemplateNode struct {
	DisplayName string                  `json:"displayName"`
	OrgType    string                  `json:"orgType"`
	Code       string                  `json:"code"`
	Leader     string                  `json:"leader"`
	Children   []*OrgTreeTemplateNode `json:"children"`
}

// OrgTreeTemplate 组织树模板（用于硬编码模板兼容）
type OrgTreeTemplate struct {
	Id          string                  `json:"id"`
	Name        string                  `json:"name"`
	Description string                  `json:"description"`
	Category    string                  `json:"category"`
	Nodes       []*OrgTreeTemplateNode  `json:"nodes"`
}

// GetOrgTreeTemplates 返回预置的组织树模板
func GetOrgTreeTemplates() []*OrgTreeTemplate {
	templates := []*OrgTreeTemplate{
		{
			Id:          "internet_tech_company",
			Name:        "互联网/科技公司",
			Description: "适用于互联网公司、科技企业的标准组织架构",
			Category:    "互联网/科技公司",
			Nodes: []*OrgTreeTemplateNode{
				{
					DisplayName: "公司总部",
					OrgType:     "org",
					Code:        "HQ",
					Leader:      "",
					Children: []*OrgTreeTemplateNode{
						{
							DisplayName: "研发部",
							OrgType:     "dept",
							Code:        "RD",
							Leader:      "",
							Children: []*OrgTreeTemplateNode{
								{DisplayName: "前端团队", OrgType: "team", Code: "RD-FE", Leader: "", Children: nil},
								{DisplayName: "后端团队", OrgType: "team", Code: "RD-BE", Leader: "", Children: nil},
								{DisplayName: "运维团队", OrgType: "team", Code: "RD-OPS", Leader: "", Children: nil},
							},
						},
						{
							DisplayName: "产品部",
							OrgType:     "dept",
							Code:        "PD",
							Leader:      "",
							Children: []*OrgTreeTemplateNode{
								{DisplayName: "产品设计组", OrgType: "team", Code: "PD-DESIGN", Leader: "", Children: nil},
								{DisplayName: "产品运营组", OrgType: "team", Code: "PD-OPS", Leader: "", Children: nil},
							},
						},
						{
							DisplayName: "运营部",
							OrgType:     "dept",
							Code:        "OPS",
							Leader:      "",
							Children: []*OrgTreeTemplateNode{
								{DisplayName: "用户运营组", OrgType: "team", Code: "OPS-USER", Leader: "", Children: nil},
								{DisplayName: "内容运营组", OrgType: "team", Code: "OPS-CONTENT", Leader: "", Children: nil},
							},
						},
						{
							DisplayName: "行政部",
							OrgType:     "dept",
							Code:        "ADMIN",
							Leader:      "",
							Children: []*OrgTreeTemplateNode{
								{DisplayName: "人力资源组", OrgType: "team", Code: "ADMIN-HR", Leader: "", Children: nil},
								{DisplayName: "财务组", OrgType: "team", Code: "ADMIN-FIN", Leader: "", Children: nil},
							},
						},
					},
				},
			},
		},
	}
	return templates
}

// ApplyOrgTreeTemplate 将模板应用到指定节点下
func ApplyOrgTreeTemplate(templateId string, targetParentId int, tenantId string, casdoorOrgName string) ([]int, error) {
	// Try to parse templateId as int (database ID)
	templateIdInt, err := strconv.Atoi(templateId)
	var dbTemplate *OrgTemplate
	if err == nil {
		// templateId is a number, look up by ID
		dbTemplate, err = GetOrgTemplate(templateIdInt)
		if err != nil {
			return nil, err
		}
		if dbTemplate == nil {
			return nil, fmt.Errorf("template not found with id: %s", templateId)
		}
	} else {
		// templateId is a string (template name), look up by name
		dbTemplate, err = GetOrgTemplateByName(templateId)
		if err != nil {
			return nil, err
		}
		if dbTemplate == nil {
			return nil, fmt.Errorf("template not found with name: %s", templateId)
		}
	}

	// Parse tree structure from JSON
	nodes, err := dbTemplate.GetTreeNodes()
	if err != nil {
		return nil, fmt.Errorf("failed to parse template tree structure: %v", err)
	}

	insertedIds := []int{}
	err = insertTemplateNodes(nodes, targetParentId, tenantId, casdoorOrgName, &insertedIds)
	if err != nil {
		return nil, err
	}
	return insertedIds, nil
}

// insertTemplateNodes 递归插入模板节点
func insertTemplateNodes(nodes []*OrgTreeTemplateNode, parentId int, tenantId string, casdoorOrgName string, insertedIds *[]int) error {
	for _, node := range nodes {
		newNode := &OrgTree{
			ParentId:       parentId,
			OrgName:        fmt.Sprintf("org_%d", time.Now().UnixNano()),
			DisplayName:    node.DisplayName,
			OrgType:        node.OrgType,
			Code:           node.Code,
			Leader:         node.Leader,
			TenantId:       tenantId,
			CasdoorOrgName: casdoorOrgName,
		}
		affected, err := ormer.Engine.Insert(newNode)
		if err != nil {
			return err
		}
		if affected > 0 {
			*insertedIds = append(*insertedIds, newNode.Id)
		}

		if len(node.Children) > 0 {
			err := insertTemplateNodes(node.Children, newNode.Id, tenantId, casdoorOrgName, insertedIds)
			if err != nil {
				return err
			}
		}
	}
	return nil
}

// CopyOrgTreeSubtree 复制组织树子树
func CopyOrgTreeSubtree(sourceNodeId int, targetParentId int, tenantId string, casdoorOrgName string) ([]int, error) {
	sourceNode, err := GetOrgTreeNode(sourceNodeId)
	if err != nil {
		return nil, err
	}
	if sourceNode == nil {
		return nil, fmt.Errorf("source node not found: %d", sourceNodeId)
	}

	insertedIds := []int{}
	err = copySubtreeRecursive(sourceNode, targetParentId, tenantId, casdoorOrgName, &insertedIds)
	if err != nil {
		return nil, err
	}
	return insertedIds, nil
}

// copySubtreeRecursive 递归复制子树
func copySubtreeRecursive(node *OrgTree, parentId int, tenantId string, casdoorOrgName string, insertedIds *[]int) error {
	newNode := &OrgTree{
		ParentId:       parentId,
		OrgName:        fmt.Sprintf("org_%d", time.Now().UnixNano()),
		DisplayName:    node.DisplayName,
		OrgType:        node.OrgType,
		Code:           node.Code,
		Leader:         node.Leader,
		TenantId:       tenantId,
		CasdoorOrgName: casdoorOrgName,
		Level:          node.Level,
		SortOrder:      node.SortOrder,
	}
	affected, err := ormer.Engine.Insert(newNode)
	if err != nil {
		return err
	}
	if affected > 0 {
		*insertedIds = append(*insertedIds, newNode.Id)
	}

	children, err := GetOrgTreeChildren(node.Id)
	if err != nil {
		return err
	}
	for _, child := range children {
		err := copySubtreeRecursive(child, newNode.Id, tenantId, casdoorOrgName, insertedIds)
		if err != nil {
			return err
		}
	}
	return nil
}

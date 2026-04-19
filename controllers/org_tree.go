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

// GetOrgTreeNodes 获取所有组织树节点
// @Title GetOrgTreeNodes
// @Tag Organization Tree API
// @Description get all organization tree nodes, optionally filtered by tenant
// @Param   tenantId     query    string  false        "The tenant ID to filter by"
// @Success 200 {array} object.OrgTree
// @router /get-org-trees [get]
func (c *ApiController) GetOrgTreeNodes() {
	tenantId := c.Ctx.Input.Query("tenantId")
	if tenantId != "" {
		nodes, err := object.GetOrgTreeNodesByTenant(tenantId)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(nodes)
	} else {
		nodes, err := object.GetOrgTreeNodes()
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		c.ResponseOk(nodes)
	}
}

// GetTenantList 获取所有租户列表
// @Title GetTenantList
// @Tag Organization Tree API
// @Description get all tenant IDs
// @Success 200 {array} string
// @router /get-tenant-list [get]
func (c *ApiController) GetTenantList() {
	tenants, err := object.GetTenantList()
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(tenants)
}

// GetOrgTreeNode 获取单个组织树节点
// @Title GetOrgTreeNode
// @Tag Organization Tree API
// @Description get organization tree node by id
// @Param   id     query    int  true        "The id of node"
// @Success 200 {object} object.OrgTree
// @router /get-org-tree [get]
func (c *ApiController) GetOrgTreeNode() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	node, err := object.GetOrgTreeNode(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(node)
}

// PostOrgTreeNode 创建组织树节点
// @Title PostOrgTreeNode
// @Tag Organization Tree API
// @Description create a new organization tree node
// @Success 200 {bool} success
// @router /add-org-tree [post]
func (c *ApiController) PostOrgTreeNode() {
	var node object.OrgTree
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &node); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.AddOrgTreeNode(&node)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// PutOrgTreeNode 更新组织树节点
// @Title PutOrgTreeNode
// @Tag Organization Tree API
// @Description update organization tree node
// @Success 200 {bool} success
// @router /update-org-tree [put]
func (c *ApiController) PutOrgTreeNode() {
	var node object.OrgTree
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &node); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.UpdateOrgTreeNode(&node)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// DeleteOrgTreeNode 删除组织树节点
// @Title DeleteOrgTreeNode
// @Tag Organization Tree API
// @Description delete organization tree node
// @Param   id     query    int  true        "The id of node"
// @Success 200 {bool} success
// @router /delete-org-tree [delete]
func (c *ApiController) DeleteOrgTreeNode() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	affected, err := object.DeleteOrgTreeNode(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// GetOrgTreeTemplates 获取组织树模板列表
// @Title GetOrgTreeTemplates
// @Tag Organization Tree API
// @Description get all organization tree templates
// @Success 200 {array} object.OrgTreeTemplate
// @router /get-org-tree-templates [get]
func (c *ApiController) GetOrgTreeTemplates() {
	templates := object.GetOrgTreeTemplates()
	c.ResponseOk(templates)
}

// ApplyOrgTreeTemplate 应用组织树模板到指定节点
// @Title ApplyOrgTreeTemplate
// @Tag Organization Tree API
// @Description apply an organization tree template to a target node
// @Param   templateId      query    string  true        "The template ID"
// @Param   targetParentId  query    int     true        "The parent node ID to apply template to"
// @Param   tenantId        query    string  false       "The tenant ID"
// @Success 200 {array} int The inserted node IDs
// @router /apply-org-tree-template [post]
func (c *ApiController) ApplyOrgTreeTemplate() {
	templateId := c.Ctx.Input.Query("templateId")
	targetParentIdStr := c.Ctx.Input.Query("targetParentId")
	targetParentId := util.ParseInt(targetParentIdStr)
	tenantId := c.Ctx.Input.Query("tenantId")
	casdoorOrgName := tenantId
	if casdoorOrgName == "" {
		casdoorOrgName = "built-in"
	}

	if targetParentId != 0 {
		// Get the target node to get its CasdoorOrgName
		targetNode, err := object.GetOrgTreeNode(targetParentId)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}
		if targetNode == nil {
			c.ResponseError("target node not found")
			return
		}

		casdoorOrgName = targetNode.CasdoorOrgName
		if tenantId == "" {
			tenantId = targetNode.TenantId
		}
	} else if tenantId == "" {
		tenantId = "built-in"
	}

	ids, err := object.ApplyOrgTreeTemplate(templateId, targetParentId, tenantId, casdoorOrgName)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(ids)
}

// CopyOrgTreeSubtree 复制组织树子树
// @Title CopyOrgTreeSubtree
// @Tag Organization Tree API
// @Description copy an organization tree subtree to a target node
// @Param   sourceNodeId    query    int     true        "The source node ID"
// @Param   targetParentId  query    int     true        "The target parent node ID"
// @Param   tenantId        query    string  false       "The tenant ID"
// @Success 200 {array} int The inserted node IDs
// @router /copy-org-tree-subtree [post]
func (c *ApiController) CopyOrgTreeSubtree() {
	sourceNodeIdStr := c.Ctx.Input.Query("sourceNodeId")
	sourceNodeId := util.ParseInt(sourceNodeIdStr)
	targetParentIdStr := c.Ctx.Input.Query("targetParentId")
	targetParentId := util.ParseInt(targetParentIdStr)
	tenantId := c.Ctx.Input.Query("tenantId")

	// Get the target node to get its CasdoorOrgName
	targetNode, err := object.GetOrgTreeNode(targetParentId)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	if targetNode == nil {
		c.ResponseError("target node not found")
		return
	}

	casdoorOrgName := targetNode.CasdoorOrgName
	if tenantId == "" {
		tenantId = targetNode.TenantId
	}

	ids, err := object.CopyOrgTreeSubtree(sourceNodeId, targetParentId, tenantId, casdoorOrgName)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(ids)
}

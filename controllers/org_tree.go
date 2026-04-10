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
// @Description get all organization tree nodes
// @Success 200 {array} object.OrgTree
// @router /get-org-trees [get]
func (c *ApiController) GetOrgTreeNodes() {
	nodes, err := object.GetOrgTreeNodes()
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(nodes)
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

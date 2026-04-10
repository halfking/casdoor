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

// GetPositions 获取岗位列表
// @Title GetPositions
// @Tag Position API
// @Description get positions, optionally filtered by department
// @Param   department  query    string  false       "The department name"
// @Success 200 {array} object.Position
// @router /get-positions [get]
func (c *ApiController) GetPositions() {
	dept := c.Ctx.Input.Query("department")
	var positions []*object.Position
	var err error
	if dept != "" {
		positions, err = object.GetPositionsByDept(dept)
	} else {
		positions, err = object.GetPositions()
	}
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(positions)
}

// GetPosition 获取单个岗位
// @Title GetPosition
// @Tag Position API
// @Description get position by id
// @Param   id     query    int  true        "The id"
// @Success 200 {object} object.Position
// @router /get-position [get]
func (c *ApiController) GetPosition() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	pos, err := object.GetPosition(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(pos)
}

// PostPosition 创建岗位
// @Title PostPosition
// @Tag Position API
// @Description create a new position
// @Success 200 {bool} success
// @router /add-position [post]
func (c *ApiController) PostPosition() {
	var pos object.Position
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &pos); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.AddPosition(&pos)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// PutPosition 更新岗位
// @Title PutPosition
// @Tag Position API
// @Description update position
// @Success 200 {bool} success
// @router /update-position [put]
func (c *ApiController) PutPosition() {
	var pos object.Position
	if err := json.Unmarshal(c.Ctx.Input.RequestBody, &pos); err != nil {
		c.ResponseError(err.Error())
		return
	}
	affected, err := object.UpdatePosition(&pos)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

// DeletePosition 删除岗位
// @Title DeletePosition
// @Tag Position API
// @Description delete position
// @Param   id     query    int  true        "The id"
// @Success 200 {bool} success
// @router /delete-position [delete]
func (c *ApiController) DeletePosition() {
	idStr := c.Ctx.Input.Query("id")
	id := util.ParseInt(idStr)
	affected, err := object.DeletePosition(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}
	c.ResponseOk(affected)
}

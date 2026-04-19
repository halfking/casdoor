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

	"github.com/beego/beego/v2/core/utils/pagination"
	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/util"
)

// GetMenus
// @Title GetMenus
// @Tag Menu API
// @Description get menus
// @Param   owner     query    string  true        "The owner of menus"
// @Success 200 {array} object.Menu The Response object
// @router /get-menus [get]
func (c *ApiController) GetMenus() {
	owner := c.Ctx.Input.Query("owner")
	limit := c.Ctx.Input.Query("pageSize")
	page := c.Ctx.Input.Query("p")
	field := c.Ctx.Input.Query("field")
	value := c.Ctx.Input.Query("value")
	sortField := c.Ctx.Input.Query("sortField")
	sortOrder := c.Ctx.Input.Query("sortOrder")
	withTree := c.Ctx.Input.Query("withTree")
	application := c.Ctx.Input.Query("application")

	if limit == "" || page == "" {
		var menus []*object.Menu
		var err error
		if application != "" {
			menus, err = object.GetMenusByApplication(owner, application)
		} else {
			menus, err = object.GetMenus(owner)
		}
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		if withTree == "true" {
			c.ResponseOk(object.BuildMenuTree(menus))
			return
		}

		c.ResponseOk(menus)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetMenuCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.NewPaginator(c.Ctx.Request, limit, count)
		menus, err := object.GetPaginationMenus(owner, paginator.Offset(), limit, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(menus, paginator.Nums())
	}
}

// GetMenu
// @Title GetMenu
// @Tag Menu API
// @Description get menu
// @Param   id     query    string  true        "The id ( owner/name ) of the menu"
// @Success 200 {object} object.Menu The Response object
// @router /get-menu [get]
func (c *ApiController) GetMenu() {
	id := c.Ctx.Input.Query("id")

	menu, err := object.GetMenu(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(menu)
}

// UpdateMenu
// @Title UpdateMenu
// @Tag Menu API
// @Description update menu
// @Param   id     query    string  true        "The id ( owner/name ) of the menu"
// @Param   body    body   object.Menu  true        "The details of the menu"
// @Success 200 {object} controllers.Response The Response object
// @router /update-menu [post]
func (c *ApiController) UpdateMenu() {
	id := c.Ctx.Input.Query("id")

	var menu object.Menu
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &menu)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdateMenu(id, &menu))
	c.ServeJSON()
}

// AddMenu
// @Title AddMenu
// @Tag Menu API
// @Description add menu
// @Param   body    body   object.Menu  true      "The details of the menu"
// @Success 200 {object} controllers.Response The Response object
// @router /add-menu [post]
func (c *ApiController) AddMenu() {
	var menu object.Menu
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &menu)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddMenu(&menu))
	c.ServeJSON()
}

// DeleteMenu
// @Title DeleteMenu
// @Tag Menu API
// @Description delete menu
// @Param   body    body   object.Menu  true        "The details of the menu"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-menu [post]
func (c *ApiController) DeleteMenu() {
	var menu object.Menu
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &menu)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeleteMenu(&menu))
	c.ServeJSON()
}

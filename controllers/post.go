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

// GetPosts
// @Title GetPosts
// @Tag Post API
// @Description get posts
// @Param   owner     query    string  true        "The owner of posts"
// @Success 200 {array} object.Post The Response object
// @router /get-posts [get]
func (c *ApiController) GetPosts() {
	owner := c.Ctx.Input.Query("owner")
	limit := c.Ctx.Input.Query("pageSize")
	page := c.Ctx.Input.Query("p")
	field := c.Ctx.Input.Query("field")
	value := c.Ctx.Input.Query("value")
	sortField := c.Ctx.Input.Query("sortField")
	sortOrder := c.Ctx.Input.Query("sortOrder")

	if limit == "" || page == "" {
		posts, err := object.GetPosts(owner)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(posts)
	} else {
		limit := util.ParseInt(limit)
		count, err := object.GetPostCount(owner, field, value)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		paginator := pagination.NewPaginator(c.Ctx.Request, limit, count)
		posts, err := object.GetPaginationPosts(owner, paginator.Offset(), limit, field, value, sortField, sortOrder)
		if err != nil {
			c.ResponseError(err.Error())
			return
		}

		c.ResponseOk(posts, paginator.Nums())
	}
}

// GetPost
// @Title GetPost
// @Tag Post API
// @Description get post
// @Param   id     query    string  true        "The id ( owner/name ) of the post"
// @Success 200 {object} object.Post The Response object
// @router /get-post [get]
func (c *ApiController) GetPost() {
	id := c.Ctx.Input.Query("id")

	post, err := object.GetPost(id)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(post)
}

// UpdatePost
// @Title UpdatePost
// @Tag Post API
// @Description update post
// @Param   id     query    string  true        "The id ( owner/name ) of the post"
// @Param   body    body   object.Post  true        "The details of the post"
// @Success 200 {object} controllers.Response The Response object
// @router /update-post [post]
func (c *ApiController) UpdatePost() {
	id := c.Ctx.Input.Query("id")

	var post object.Post
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &post)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.UpdatePost(id, &post))
	c.ServeJSON()
}

// AddPost
// @Title AddPost
// @Tag Post API
// @Description add post
// @Param   body    body   object.Post  true      "The details of the post"
// @Success 200 {object} controllers.Response The Response object
// @router /add-post [post]
func (c *ApiController) AddPost() {
	var post object.Post
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &post)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.AddPost(&post))
	c.ServeJSON()
}

// DeletePost
// @Title DeletePost
// @Tag Post API
// @Description delete post
// @Param   body    body   object.Post  true        "The details of the post"
// @Success 200 {object} controllers.Response The Response object
// @router /delete-post [post]
func (c *ApiController) DeletePost() {
	var post object.Post
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &post)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.Data["json"] = wrapActionResponse(object.DeletePost(&post))
	c.ServeJSON()
}

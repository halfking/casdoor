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

type Post struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`

	DisplayName string `xorm:"varchar(100)" json:"displayName"`
	Description string `xorm:"varchar(200)" json:"description"`
	Code        string `xorm:"varchar(50)" json:"code"`
	SortOrder   int    `json:"sortOrder"`
	IsEnabled   bool   `json:"isEnabled"`
}

func (p *Post) GetId() string {
	return fmt.Sprintf("%s/%s", p.Owner, p.Name)
}

func GetPostCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Post{})
}

func GetPosts(owner string) ([]*Post, error) {
	posts := []*Post{}
	err := ormer.Engine.Desc("created_time").Find(&posts, &Post{Owner: owner})
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func GetPaginationPosts(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Post, error) {
	posts := []*Post{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&posts)
	if err != nil {
		return nil, err
	}
	return posts, nil
}

func getPost(owner string, name string) (*Post, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	post := Post{Owner: owner, Name: name}
	existed, err := ormer.Engine.Get(&post)
	if err != nil {
		return nil, err
	}
	if existed {
		return &post, nil
	}
	return nil, nil
}

func GetPost(id string) (*Post, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return nil, err
	}
	return getPost(owner, name)
}

func UpdatePost(id string, post *Post) (bool, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return false, err
	}
	oldPost, err := getPost(owner, name)
	if oldPost == nil {
		return false, err
	}

	affected, err := ormer.Engine.ID(core.PK{owner, name}).AllCols().Update(post)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddPost(post *Post) (bool, error) {
	affected, err := ormer.Engine.Insert(post)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddPosts(posts []*Post) (bool, error) {
	if len(posts) == 0 {
		return false, nil
	}
	affected, err := ormer.Engine.Insert(posts)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeletePost(post *Post) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{post.Owner, post.Name}).Delete(&Post{})
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

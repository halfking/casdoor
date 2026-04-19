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

type Menu struct {
	Owner       string `xorm:"varchar(100) notnull pk" json:"owner"`
	Name        string `xorm:"varchar(100) notnull pk" json:"name"`
	CreatedTime string `xorm:"varchar(100)" json:"createdTime"`
	UpdatedTime string `xorm:"varchar(100)" json:"updatedTime"`

	DisplayName string `xorm:"varchar(100)" json:"displayName"`
	Description string `xorm:"varchar(200)" json:"description"`
	Application string `xorm:"varchar(100) index" json:"application"`
	ParentId    string `xorm:"varchar(100)" json:"parentId"`
	Path        string `xorm:"varchar(200)" json:"path"`
	Icon        string `xorm:"varchar(100)" json:"icon"`
	Component   string `xorm:"varchar(200)" json:"component"`
	Type        string `xorm:"varchar(20)" json:"type"` // Menu / Button
	SortOrder   int    `json:"sortOrder"`
	Visible     bool   `json:"visible"`
	IsEnabled   bool   `json:"isEnabled"`

	Children []*Menu `xorm:"-" json:"children,omitempty"`
}

func (m *Menu) GetId() string {
	return fmt.Sprintf("%s/%s", m.Owner, m.Name)
}

func GetMenuCount(owner, field, value string) (int64, error) {
	session := GetSession(owner, -1, -1, field, value, "", "")
	return session.Count(&Menu{})
}

func GetMenus(owner string) ([]*Menu, error) {
	menus := []*Menu{}
	err := ormer.Engine.Desc("sort_order").Find(&menus, &Menu{Owner: owner})
	if err != nil {
		return nil, err
	}
	return menus, nil
}

func GetPaginationMenus(owner string, offset, limit int, field, value, sortField, sortOrder string) ([]*Menu, error) {
	menus := []*Menu{}
	session := GetSession(owner, offset, limit, field, value, sortField, sortOrder)
	err := session.Find(&menus)
	if err != nil {
		return nil, err
	}
	return menus, nil
}

func getMenu(owner string, name string) (*Menu, error) {
	if owner == "" || name == "" {
		return nil, nil
	}

	menu := Menu{Owner: owner, Name: name}
	existed, err := ormer.Engine.Get(&menu)
	if err != nil {
		return nil, err
	}
	if existed {
		return &menu, nil
	}
	return nil, nil
}

func GetMenu(id string) (*Menu, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return nil, err
	}
	return getMenu(owner, name)
}

func UpdateMenu(id string, menu *Menu) (bool, error) {
	owner, name, err := util.GetOwnerAndNameFromIdWithError(id)
	if err != nil {
		return false, err
	}
	oldMenu, err := getMenu(owner, name)
	if oldMenu == nil {
		return false, err
	}

	affected, err := ormer.Engine.ID(core.PK{owner, name}).AllCols().Update(menu)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddMenu(menu *Menu) (bool, error) {
	affected, err := ormer.Engine.Insert(menu)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func AddMenus(menus []*Menu) (bool, error) {
	if len(menus) == 0 {
		return false, nil
	}
	affected, err := ormer.Engine.Insert(menus)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func DeleteMenu(menu *Menu) (bool, error) {
	affected, err := ormer.Engine.ID(core.PK{menu.Owner, menu.Name}).Delete(&Menu{})
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

func GetMenusByApplication(owner, application string) ([]*Menu, error) {
	menus := []*Menu{}
	err := ormer.Engine.Where("owner = ? AND application = ?", owner, application).Asc("sort_order").Find(&menus)
	if err != nil {
		return nil, err
	}
	return menus, nil
}

func BuildMenuTree(menus []*Menu) []*Menu {
	menuMap := make(map[string]*Menu)
	var roots []*Menu

	for _, m := range menus {
		menuMap[m.Name] = m
	}

	for _, m := range menus {
		if m.ParentId == "" {
			roots = append(roots, m)
		} else {
			parent, ok := menuMap[m.ParentId]
			if ok {
				parent.Children = append(parent.Children, m)
			} else {
				roots = append(roots, m)
			}
		}
	}
	return roots
}

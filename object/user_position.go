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
	"strings"
)

type UserPosition struct {
	Id         int    `xorm:"int pk autoincr" json:"id"`
	UserName   string `xorm:"varchar(100)" json:"userName"`
	UserOwner  string `xorm:"varchar(100)" json:"userOwner"`
	PositionId int    `xorm:"int" json:"positionId"`
	CreatedAt  string `xorm:"-" json:"createdAt"`
}

func (up *UserPosition) TableName() string {
	return "user_position"
}

// AssignPositionToUser 分配岗位给用户
func AssignPositionToUser(userName, userOwner string, positionId int) (bool, error) {
	up := &UserPosition{
		UserName:   userName,
		UserOwner:  userOwner,
		PositionId: positionId,
	}
	affected, err := ormer.Engine.Insert(up)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

// UnassignPositionFromUser 取消岗位分配
func UnassignPositionFromUser(userName, userOwner string, positionId int) (bool, error) {
	up := &UserPosition{
		UserName:   userName,
		UserOwner:  userOwner,
		PositionId: positionId,
	}
	affected, err := ormer.Engine.Where("user_name = ? AND user_owner = ? AND position_id = ?",
		userName, userOwner, positionId).Delete(up)
	if err != nil {
		return false, err
	}
	return affected != 0, nil
}

// GetUserSystemPrompts 获取用户所有岗位的 systemPrompt，拼接为一个字符串
func GetUserSystemPrompts(userName, userOwner string) (string, error) {
	ups := []*UserPosition{}
	err := ormer.Engine.Where("user_name = ? AND user_owner = ?", userName, userOwner).Find(&ups)
	if err != nil {
		return "", err
	}

	var prompts []string
	for _, up := range ups {
		pos, err := GetPosition(up.PositionId)
		if err != nil || pos == nil {
			continue
		}
		if pos.SystemPrompt != "" {
			prompts = append(prompts, fmt.Sprintf("[%s]\n%s", pos.RoleName, pos.SystemPrompt))
		}
	}

	if len(prompts) == 0 {
		return "", nil
	}
	return strings.Join(prompts, "\n\n---\n\n"), nil
}

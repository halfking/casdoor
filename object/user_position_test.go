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
	"testing"
)

func TestMultiPosition(t *testing.T) {
	// 1. 清理测试数据
	UnassignPositionFromUser("testuser", "kaixuan", 1)
	UnassignPositionFromUser("testuser", "kaixuan", 2)

	// 2. 分配两个岗位
	AssignPositionToUser("testuser", "kaixuan", 1)
	AssignPositionToUser("testuser", "kaixuan", 2)

	// 3. 验证
	prompt, err := GetUserSystemPrompts("testuser", "kaixuan")
	if err != nil {
		t.Errorf("GetUserSystemPrompts failed: %v", err)
	}
	if prompt == "" {
		t.Error("Expected non-empty system prompt")
	}
	t.Logf("Combined prompt:\n%s", prompt)
}

// Copyright 2022 The Casdoor Authors. All Rights Reserved.
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

//go:build !skipCi

package deployment

import (
	"os"
	"strings"
	"testing"

	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/util"
)

func TestRewriteAssetPaths(t *testing.T) {
	html := `<link rel="stylesheet" href="/assets/index.css"><script src="/static/js/main.js"></script><img src="/img/logo.svg">`
	rewritten := rewriteAssetPaths(html, "https://cdn.example.com/")

	expectedSnippets := []string{
		`href="https://cdn.example.com/assets/index.css"`,
		`src="https://cdn.example.com/static/js/main.js"`,
		`src="https://cdn.example.com/img/logo.svg"`,
	}

	for _, snippet := range expectedSnippets {
		if !strings.Contains(rewritten, snippet) {
			t.Fatalf("expected rewritten html to contain %s, got %s", snippet, rewritten)
		}
	}
}

func TestDeployStaticFiles(t *testing.T) {
	if os.Getenv("CASDOOR_RUN_DEPLOY_TESTS") != "1" {
		t.Skip("set CASDOOR_RUN_DEPLOY_TESTS=1 to run external deployment integration test")
	}

	object.InitConfig()

	provider, err := object.GetProvider(util.GetId("admin", "provider_storage_aliyun_oss"))
	if err != nil {
		panic(err)
	}

	deployStaticFiles(provider)
}

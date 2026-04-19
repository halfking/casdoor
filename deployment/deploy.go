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

package deployment

import (
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/casdoor/casdoor/object"
	"github.com/casdoor/casdoor/storage"
	"github.com/casdoor/casdoor/util"
	"github.com/casdoor/oss"
)

func deployStaticFiles(provider *object.Provider) {
	certificate := ""
	if provider.Category == "Storage" && provider.Type == "Casdoor" {
		cert, err := object.GetCert(util.GetId(provider.Owner, provider.Cert))
		if err != nil {
			panic(err)
		}
		if cert == nil {
			panic(errors.New("storage provider certificate not found"))
		}
		certificate = cert.Certificate
	}
	storageProvider, err := storage.GetStorageProvider(provider.Type, provider.ClientId, provider.ClientSecret, provider.RegionId, provider.Bucket, provider.Endpoint, certificate, provider.Content)
	if err != nil {
		panic(err)
	}
	if storageProvider == nil {
		panic(fmt.Sprintf("the provider type: %s is not supported", provider.Type))
	}

	uploadBuildAssets(storageProvider, filepath.Join("..", "web", "build"))
	updateHtml(provider.Domain)
}


func uploadBuildAssets(storageProvider oss.StorageInterface, buildDir string) {
	assetFiles := listBuildAssetFiles(buildDir)
	for _, relativePath := range assetFiles {
		fullPath := filepath.Join(buildDir, relativePath)
		file, err := os.Open(filepath.Clean(fullPath))
		if err != nil {
			panic(err)
		}

		objectKey := filepath.ToSlash(relativePath)
		_, err = storageProvider.Put(objectKey, file)
		_ = file.Close()
		if err != nil {
			panic(err)
		}

		fmt.Printf("Uploaded [%s] to [%s]\n", fullPath, objectKey)
	}
}

func listBuildAssetFiles(buildDir string) []string {
	assetFiles := make([]string, 0)
	err := filepath.Walk(buildDir, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}
		if info.IsDir() {
			return nil
		}

		relativePath, err := filepath.Rel(buildDir, path)
		if err != nil {
			return err
		}
		relativePath = filepath.ToSlash(relativePath)
		if relativePath == "index.html" {
			return nil
		}
		assetFiles = append(assetFiles, relativePath)
		return nil
	})
	if err != nil {
		panic(err)
	}
	sort.Strings(assetFiles)
	return assetFiles
}

func updateHtml(domainPath string) {
	htmlPath := "../web/build/index.html"
	html := rewriteAssetPaths(util.ReadStringFromPath(htmlPath), domainPath)
	util.WriteStringToPath(html, htmlPath)

	fmt.Printf("Updated HTML to [%s]\n", html)
}

func rewriteAssetPaths(html string, domainPath string) string {
	replacements := map[string]string{
		"\"/static/":                 fmt.Sprintf("\"%sstatic/", domainPath),
		"\"/assets/":                 fmt.Sprintf("\"%sassets/", domainPath),
		"\"/img/":                    fmt.Sprintf("\"%simg/", domainPath),
		"src=\"/static/":             fmt.Sprintf("src=\"%sstatic/", domainPath),
		"src=\"/assets/":             fmt.Sprintf("src=\"%sassets/", domainPath),
		"src=\"/img/":                fmt.Sprintf("src=\"%simg/", domainPath),
		"href=\"/static/":            fmt.Sprintf("href=\"%sstatic/", domainPath),
		"href=\"/assets/":            fmt.Sprintf("href=\"%sassets/", domainPath),
		"href=\"/img/":               fmt.Sprintf("href=\"%simg/", domainPath),
		"content=\"/static/":         fmt.Sprintf("content=\"%sstatic/", domainPath),
		"content=\"/assets/":         fmt.Sprintf("content=\"%sassets/", domainPath),
		"content=\"/img/":            fmt.Sprintf("content=\"%simg/", domainPath),
	}

	for oldValue, newValue := range replacements {
		html = strings.ReplaceAll(html, oldValue, newValue)
	}

	return html
}

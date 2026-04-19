// Copyright 2026 The Casdoor Authors. All Rights Reserved.
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
	"testing"

	"github.com/casdoor/casdoor/object"
)

func TestNormalizeActionToMethod(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"", "GET"},
		{"Read", "GET"},
		{"read", "GET"},
		{"READ", "GET"},
		{"List", "GET"},
		{"GET", "GET"},
		{"get", "GET"},
		{"Write", "POST"},
		{"write", "POST"},
		{"Create", "POST"},
		{"Update", "POST"},
		{"Delete", "POST"},
		{"POST", "POST"},
		{"PUT", "POST"},
		{"PATCH", "POST"},
		{"  Read  ", "GET"},
		{"  Write  ", "POST"},
		{"CUSTOM", "CUSTOM"},
		{"unknown", "UNKNOWN"},
	}

	for _, tt := range tests {
		result := normalizeActionToMethod(tt.input)
		if result != tt.expected {
			t.Errorf("normalizeActionToMethod(%q) = %q, want %q", tt.input, result, tt.expected)
		}
	}
}

func TestNormalizeFeaturePath(t *testing.T) {
	tests := []struct {
		input    string
		expected string
	}{
		{"", ""},
		{"/dashboard", "/dashboard"},
		{"dashboard", "/dashboard"},
		{"/management/users", "/management/users"},
		{"management/users", "/management/users"},
		{"  /path  ", "/path"},
		{"  path  ", "/path"},
	}

	for _, tt := range tests {
		result := normalizeFeaturePath(tt.input)
		if result != tt.expected {
			t.Errorf("normalizeFeaturePath(%q) = %q, want %q", tt.input, result, tt.expected)
		}
	}
}

func TestBffResolvePermissionsRequest_Fields(t *testing.T) {
	req := BffResolvePermissionsRequest{
		Tenant:  "kaixuan",
		Subject: "kaixuan/admin",
		Checks:  []string{"/dashboard", "/management/users"},
	}
	if req.Tenant != "kaixuan" {
		t.Errorf("expected tenant 'kaixuan', got %q", req.Tenant)
	}
	if len(req.Checks) != 2 {
		t.Errorf("expected 2 checks, got %d", len(req.Checks))
	}
}

func TestBffCheckDataScopeRequest_Fields(t *testing.T) {
	req := BffCheckDataScopeRequest{
		Tenant:        "kaixuan",
		Subject:       "kaixuan/admin",
		ResourceType:  "User",
		Operation:     "Read",
		RecordContext: map[string]interface{}{"key": "value"},
	}
	if req.ResourceType != "User" {
		t.Errorf("expected resourceType 'User', got %q", req.ResourceType)
	}
	if req.Operation != "Read" {
		t.Errorf("expected operation 'Read', got %q", req.Operation)
	}
}

func TestShouldBypassBffPermissionCheck(t *testing.T) {
	tests := []struct {
		name     string
		subject  *object.User
		expected bool
	}{
		{name: "nil user", subject: nil, expected: false},
		{name: "org admin only", subject: &object.User{Owner: "kaixuan", IsAdmin: true}, expected: false},
		{name: "global admin", subject: &object.User{Owner: "built-in", IsAdmin: true}, expected: true},
	}

	for _, tt := range tests {
		if got := shouldBypassBffPermissionCheck(tt.subject); got != tt.expected {
			t.Errorf("%s: shouldBypassBffPermissionCheck() = %v, want %v", tt.name, got, tt.expected)
		}
	}
}

func TestShouldReturnAllTenantsForOwner(t *testing.T) {
	tests := []struct {
		name     string
		user     *object.User
		owner    string
		expected bool
	}{
		{name: "nil user", user: nil, owner: "built-in", expected: false},
		{name: "global admin default owner", user: &object.User{Owner: "built-in", IsAdmin: true}, owner: "built-in", expected: true},
		{name: "global admin explicit owner", user: &object.User{Owner: "built-in", IsAdmin: true}, owner: "admin", expected: false},
		{name: "tenant admin", user: &object.User{Owner: "kaixuan", IsAdmin: true}, owner: "built-in", expected: false},
	}

	for _, tt := range tests {
		if got := shouldReturnAllTenantsForOwner(tt.user, tt.owner); got != tt.expected {
			t.Errorf("%s: shouldReturnAllTenantsForOwner() = %v, want %v", tt.name, got, tt.expected)
		}
	}
}

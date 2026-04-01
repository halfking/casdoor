// Copyright 2026 The Casdoor Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0

package object

import (
	"testing"
)

func TestBuildMenuTree_Empty(t *testing.T) {
	tree := BuildMenuTree(nil)
	if tree != nil {
		t.Fatalf("expected nil, got %v", tree)
	}
}

func TestBuildMenuTree_FlatRoots(t *testing.T) {
	menus := []*Menu{
		{Name: "dashboard", ParentId: "", SortOrder: 1},
		{Name: "settings", ParentId: "", SortOrder: 2},
	}
	tree := BuildMenuTree(menus)
	if len(tree) != 2 {
		t.Fatalf("expected 2 roots, got %d", len(tree))
	}
	if tree[0].Name != "dashboard" {
		t.Errorf("expected first root 'dashboard', got %q", tree[0].Name)
	}
	if tree[1].Name != "settings" {
		t.Errorf("expected second root 'settings', got %q", tree[1].Name)
	}
}

func TestBuildMenuTree_NestedChildren(t *testing.T) {
	menus := []*Menu{
		{Name: "rbac", ParentId: "", SortOrder: 1},
		{Name: "roles", ParentId: "rbac", SortOrder: 1},
		{Name: "permissions", ParentId: "rbac", SortOrder: 2},
	}
	tree := BuildMenuTree(menus)
	if len(tree) != 1 {
		t.Fatalf("expected 1 root, got %d", len(tree))
	}
	root := tree[0]
	if root.Name != "rbac" {
		t.Errorf("expected root 'rbac', got %q", root.Name)
	}
	if len(root.Children) != 2 {
		t.Fatalf("expected 2 children, got %d", len(root.Children))
	}
	if root.Children[0].Name != "roles" {
		t.Errorf("expected first child 'roles', got %q", root.Children[0].Name)
	}
	if root.Children[1].Name != "permissions" {
		t.Errorf("expected second child 'permissions', got %q", root.Children[1].Name)
	}
}

func TestBuildMenuTree_OrphanParentBecomesRoot(t *testing.T) {
	menus := []*Menu{
		{Name: "child", ParentId: "nonexistent", SortOrder: 1},
	}
	tree := BuildMenuTree(menus)
	if len(tree) != 1 {
		t.Fatalf("expected 1 root (orphan promoted), got %d", len(tree))
	}
	if tree[0].Name != "child" {
		t.Errorf("expected orphan 'child' as root, got %q", tree[0].Name)
	}
}

func TestBuildMenuTree_ThreeLevels(t *testing.T) {
	menus := []*Menu{
		{Name: "root", ParentId: ""},
		{Name: "level1", ParentId: "root"},
		{Name: "level2", ParentId: "level1"},
	}
	tree := BuildMenuTree(menus)
	if len(tree) != 1 {
		t.Fatalf("expected 1 root, got %d", len(tree))
	}
	if len(tree[0].Children) != 1 {
		t.Fatalf("expected 1 child at level1, got %d", len(tree[0].Children))
	}
	if len(tree[0].Children[0].Children) != 1 {
		t.Fatalf("expected 1 child at level2, got %d", len(tree[0].Children[0].Children))
	}
	if tree[0].Children[0].Children[0].Name != "level2" {
		t.Errorf("expected 'level2', got %q", tree[0].Children[0].Children[0].Name)
	}
}

func TestBuildMenuTree_MixedRootsAndChildren(t *testing.T) {
	menus := []*Menu{
		{Name: "dashboard", ParentId: ""},
		{Name: "rbac", ParentId: ""},
		{Name: "roles", ParentId: "rbac"},
		{Name: "permissions", ParentId: "rbac"},
		{Name: "monitoring", ParentId: ""},
	}
	tree := BuildMenuTree(menus)
	if len(tree) != 3 {
		t.Fatalf("expected 3 roots, got %d", len(tree))
	}

	// Find rbac node
	var rbac *Menu
	for _, m := range tree {
		if m.Name == "rbac" {
			rbac = m
			break
		}
	}
	if rbac == nil {
		t.Fatal("rbac root not found")
	}
	if len(rbac.Children) != 2 {
		t.Errorf("expected 2 children under rbac, got %d", len(rbac.Children))
	}
}

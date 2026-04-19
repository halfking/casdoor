// Copyright 2021 The Casdoor Authors. All Rights Reserved.
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
	"encoding/gob"
	"fmt"
	"os"

	"github.com/casdoor/casdoor/conf"
	"github.com/casdoor/casdoor/util"
	"github.com/go-webauthn/webauthn/webauthn"
)

func InitDb() {
	initBuiltInOrganization()
	initBuiltInProvider()
	initBuiltInUser()
	initBuiltInApplication()
	initBuiltInCert()
	initBuiltInLdap()
	initBuiltInUserModel()
	initBuiltInApiModel()
	initBuiltInUserAdapter()
	initBuiltInApiAdapter()
	initBuiltInUserEnforcer()
	initBuiltInApiEnforcer()
	initBuiltInRole()
	initBuiltInMenu()
	initBuiltInPermission()
	initBuiltInDepartments()
	initBuiltInPosts()
	initBuiltInPositions()
	initBuiltInOrgTemplates()
	initBuiltInRules()
	initBuiltInWorkflows()

	initWebAuthn()
}

func getBuiltInRoles() []*Role {
	return []*Role{
		{
			Owner:       "built-in",
			Name:        "role-built-in-admin",
			DisplayName: "Built-in Admin",
			Description: "Default administrator role for the built-in organization",
			Users:       []string{"built-in/admin"},
			Groups:      []string{},
			Roles:       []string{},
			Domains:     []string{},
			IsEnabled:   true,
		},
		{
			Owner:       "built-in",
			Name:        "role-built-in-readonly",
			DisplayName: "Built-in Readonly",
			Description: "Read-only baseline role for built-in operators",
			Users:       []string{},
			Groups:      []string{},
			Roles:       []string{},
			Domains:     []string{},
			IsEnabled:   true,
		},
	}
}

func getBuiltInMenus() []*Menu {
	createdTime := util.GetCurrentTime()

	return []*Menu{
		{Owner: "built-in", Name: "builtin-dashboard", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Dashboard", Description: "Built-in dashboard", Application: "app-built-in", ParentId: "", Path: "/", Icon: "DashboardOutlined", Component: "DashboardPage", Type: "Menu", SortOrder: 1, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-organizations", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Organizations", Description: "Manage organizations", Application: "app-built-in", ParentId: "", Path: "/management/organizations", Icon: "BankOutlined", Component: "OrganizationListPage", Type: "Menu", SortOrder: 2, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-users", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Users", Description: "Manage users", Application: "app-built-in", ParentId: "", Path: "/management/users", Icon: "UserOutlined", Component: "UserListPage", Type: "Menu", SortOrder: 3, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-applications", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Applications", Description: "Manage applications", Application: "app-built-in", ParentId: "", Path: "/management/applications", Icon: "AppstoreOutlined", Component: "ApplicationListPage", Type: "Menu", SortOrder: 4, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-access-control", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Access Control", Description: "Permission and authorization controls", Application: "app-built-in", ParentId: "", Path: "", Icon: "SafetyOutlined", Component: "", Type: "Menu", SortOrder: 5, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-roles", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Roles", Description: "Manage roles", Application: "app-built-in", ParentId: "builtin-access-control", Path: "/management/roles", Icon: "TeamOutlined", Component: "RoleListPage", Type: "Menu", SortOrder: 1, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-permissions", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Permissions", Description: "Manage permissions", Application: "app-built-in", ParentId: "builtin-access-control", Path: "/management/permissions", Icon: "KeyOutlined", Component: "PermissionListPage", Type: "Menu", SortOrder: 2, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-models", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Models", Description: "Manage authorization models", Application: "app-built-in", ParentId: "builtin-access-control", Path: "/management/models", Icon: "BlockOutlined", Component: "ModelListPage", Type: "Menu", SortOrder: 3, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-permission-rules", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Permission Rules", Description: "Manage permission rules", Application: "app-built-in", ParentId: "builtin-access-control", Path: "/management/permission-rules", Icon: "FireOutlined", Component: "PermissionRuleListPage", Type: "Menu", SortOrder: 4, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-adapters", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Adapters", Description: "Manage Casbin adapters", Application: "app-built-in", ParentId: "builtin-access-control", Path: "/management/adapters", Icon: "DeploymentUnitOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 5, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-enforcers", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Enforcers", Description: "Manage Casbin enforcers", Application: "app-built-in", ParentId: "builtin-access-control", Path: "/management/enforcers", Icon: "ControlOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 6, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-org-structure", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Organization Structure", Description: "Manage groups and organizational structure", Application: "app-built-in", ParentId: "", Path: "", Icon: "ApartmentOutlined", Component: "", Type: "Menu", SortOrder: 6, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-groups", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Groups", Description: "Manage groups", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/groups", Icon: "GroupOutlined", Component: "GroupListPage", Type: "Menu", SortOrder: 1, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-departments", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Departments", Description: "Manage departments", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/departments", Icon: "ClusterOutlined", Component: "DepartmentListPage", Type: "Menu", SortOrder: 2, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-org-templates", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Templates", Description: "Manage organization templates", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/org-templates", Icon: "ApartmentOutlined", Component: "OrgTemplateListPage", Type: "Menu", SortOrder: 3, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-org-tree", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Org Tree", Description: "Manage organization tree", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/org-tree", Icon: "PartitionOutlined", Component: "OrgTreePage", Type: "Menu", SortOrder: 4, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-posts", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Posts", Description: "Manage posts", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/posts", Icon: "IdcardOutlined", Component: "PostListPage", Type: "Menu", SortOrder: 5, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-positions", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Positions", Description: "Manage positions", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/positions", Icon: "SolutionOutlined", Component: "PositionListPage", Type: "Menu", SortOrder: 6, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-menus", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Menus", Description: "Manage menus", Application: "app-built-in", ParentId: "builtin-org-structure", Path: "/management/menus", Icon: "MenuOutlined", Component: "MenuListPage", Type: "Menu", SortOrder: 7, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-automation", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Automation", Description: "Manage workflow baselines and executions", Application: "app-built-in", ParentId: "", Path: "", Icon: "BranchesOutlined", Component: "", Type: "Menu", SortOrder: 7, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-workflows", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Workflows", Description: "Manage workflows", Application: "app-built-in", ParentId: "builtin-automation", Path: "/management/workflows", Icon: "DeploymentUnitOutlined", Component: "WorkflowListPage", Type: "Menu", SortOrder: 1, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-workflow-executions", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Workflow Executions", Description: "Inspect workflow executions", Application: "app-built-in", ParentId: "builtin-automation", Path: "/management/workflow-executions", Icon: "ScheduleOutlined", Component: "WorkflowExecutionListPage", Type: "Menu", SortOrder: 2, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-system", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "System", Description: "System-level integrations and credentials", Application: "app-built-in", ParentId: "", Path: "", Icon: "SettingOutlined", Component: "", Type: "Menu", SortOrder: 8, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-providers", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Providers", Description: "Manage providers", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/providers", Icon: "CloudServerOutlined", Component: "ProviderListPage", Type: "Menu", SortOrder: 1, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-certs", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Certificates", Description: "Manage certificates", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/certs", Icon: "SafetyCertificateOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 2, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-ldaps", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "LDAP", Description: "Manage LDAP integrations", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/ldaps", Icon: "ClusterOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 3, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-tokens", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Tokens", Description: "Manage issued tokens", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/tokens", Icon: "KeyOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 4, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-sessions", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Sessions", Description: "Inspect active sessions", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/sessions", Icon: "HistoryOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 5, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-records", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Records", Description: "Inspect audit records", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/records", Icon: "FileSearchOutlined", Component: "GenericResourceListPage", Type: "Menu", SortOrder: 6, Visible: true, IsEnabled: true},
		{Owner: "built-in", Name: "builtin-system-info", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "System Info", Description: "Inspect system info", Application: "app-built-in", ParentId: "builtin-system", Path: "/management/sysinfo", Icon: "InfoCircleOutlined", Component: "SystemInfoPage", Type: "Menu", SortOrder: 7, Visible: true, IsEnabled: true},
	}
}

func getBuiltInDepartments() []*Department {
	createdTime := util.GetCurrentTime()

	return []*Department{
		{Owner: "built-in", Name: "dept-built-in-platform", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Platform Governance", Description: "Owns built-in authorization baseline and tenant governance", ParentId: "", Code: "PLATFORM", Level: 1, SortOrder: 1, Leader: "built-in/admin", IsEnabled: true},
		{Owner: "built-in", Name: "dept-built-in-security", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Security Operations", Description: "Owns security reviews, rules and enforcement baselines", ParentId: "", Code: "SECURITY", Level: 1, SortOrder: 2, Leader: "built-in/admin", IsEnabled: true},
		{Owner: "built-in", Name: "dept-built-in-operations", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Operations Enablement", Description: "Owns workflows, onboarding and day-2 operations", ParentId: "", Code: "OPERATIONS", Level: 1, SortOrder: 3, Leader: "built-in/admin", IsEnabled: true},
	}
}

func getBuiltInPosts() []*Post {
	createdTime := util.GetCurrentTime()

	return []*Post{
		{Owner: "built-in", Name: "post-built-in-platform-admin", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Platform Admin", Description: "Platform baseline administrator", Code: "PLATFORM-ADMIN", SortOrder: 1, IsEnabled: true},
		{Owner: "built-in", Name: "post-built-in-security-reviewer", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Security Reviewer", Description: "Security rule reviewer and approver", Code: "SECURITY-REVIEWER", SortOrder: 2, IsEnabled: true},
		{Owner: "built-in", Name: "post-built-in-ops-coordinator", CreatedTime: createdTime, UpdatedTime: createdTime, DisplayName: "Operations Coordinator", Description: "Workflow operator and execution coordinator", Code: "OPS-COORDINATOR", SortOrder: 3, IsEnabled: true},
	}
}

func getBuiltInPositions() []*Position {
	return []*Position{
		{RoleOwner: "built-in", RoleName: "platform-admin", Code: "PLATFORM-ADMIN", FullDescription: "Maintain built-in baseline objects, menus and tenant governance.", Skills: "RBAC, Casdoor, platform governance", Requirements: "Understands Casdoor RBAC and bootstrap flows.", SystemPrompt: "Maintain built-in authorization baseline and platform governance.", Department: "dept-built-in-platform", ReportsTo: "built-in/admin", ImpliedRole: "built-in/role-built-in-admin", OrgTreeCode: "PLATFORM", AgentProvider: "", AgentModel: ""},
		{RoleOwner: "built-in", RoleName: "security-reviewer", Code: "SECURITY-REVIEWER", FullDescription: "Review permission rules and audit security-sensitive changes.", Skills: "WAF rules, IP rules, auditing", Requirements: "Can review access rules and security policy changes.", SystemPrompt: "Review security rules and identify risky permission changes.", Department: "dept-built-in-security", ReportsTo: "built-in/admin", ImpliedRole: "built-in/role-built-in-admin", OrgTreeCode: "SECURITY", AgentProvider: "", AgentModel: ""},
		{RoleOwner: "built-in", RoleName: "ops-coordinator", Code: "OPS-COORDINATOR", FullDescription: "Coordinate workflow execution, tenant onboarding and runbook follow-up.", Skills: "Workflow operations, tenant onboarding", Requirements: "Can operate standard built-in workflows.", SystemPrompt: "Coordinate workflow execution and tenant onboarding based on built-in templates.", Department: "dept-built-in-operations", ReportsTo: "built-in/admin", ImpliedRole: "built-in/role-built-in-readonly", OrgTreeCode: "OPERATIONS", AgentProvider: "", AgentModel: ""},
	}
}

func getBuiltInOrgTemplates() []*OrgTemplate {
	standardTemplate := &OrgTemplate{
		Owner:        "built-in",
		Name:         "org-template-built-in-standard",
		DisplayName:  "Built-in Standard Organization",
		Description:  "Official standard baseline for tenant onboarding and department seeding.",
		TemplateType: "standard",
	}
	_ = standardTemplate.SetTreeNodes([]*OrgTreeTemplateNode{
		{
			DisplayName: "Platform Governance",
			OrgType:     "department",
			Code:        "PLATFORM",
			Leader:      "built-in/admin",
			Children: []*OrgTreeTemplateNode{
				{DisplayName: "Access Control", OrgType: "team", Code: "PLATFORM-ACCESS", Leader: "built-in/admin", Children: nil},
				{DisplayName: "Tenant Operations", OrgType: "team", Code: "PLATFORM-TENANT", Leader: "built-in/admin", Children: nil},
			},
		},
		{
			DisplayName: "Security Operations",
			OrgType:     "department",
			Code:        "SECURITY",
			Leader:      "built-in/admin",
			Children: []*OrgTreeTemplateNode{
				{DisplayName: "Rule Review", OrgType: "team", Code: "SECURITY-RULE", Leader: "built-in/admin", Children: nil},
			},
		},
	})

	leanTemplate := &OrgTemplate{
		Owner:        "built-in",
		Name:         "org-template-built-in-lean",
		DisplayName:  "Built-in Lean Team",
		Description:  "Minimal team template for small tenants derived from the built-in standard baseline.",
		TemplateType: "startup",
	}
	_ = leanTemplate.SetTreeNodes([]*OrgTreeTemplateNode{
		{
			DisplayName: "Core Team",
			OrgType:     "department",
			Code:        "CORE",
			Leader:      "built-in/admin",
			Children: []*OrgTreeTemplateNode{
				{DisplayName: "Operations", OrgType: "team", Code: "CORE-OPS", Leader: "built-in/admin", Children: nil},
				{DisplayName: "Security", OrgType: "team", Code: "CORE-SEC", Leader: "built-in/admin", Children: nil},
			},
		},
	})

	return []*OrgTemplate{standardTemplate, leanTemplate}
}

func getBuiltInRules() []*Rule {
	createdTime := util.GetCurrentTime()

	return []*Rule{
		{Owner: "built-in", Name: "rule-built-in-allow-loopback", CreatedTime: createdTime, UpdatedTime: createdTime, Type: "IP", Expressions: []*Expression{{Name: "sourceIp", Operator: "in", Value: "127.0.0.1/32,::1/128"}}, Action: "Allow", StatusCode: 200, Reason: "Allow loopback health and local operations", IsVerbose: false},
		{Owner: "built-in", Name: "rule-built-in-admin-rate-limit", CreatedTime: createdTime, UpdatedTime: createdTime, Type: "IP Rate Limiting", Expressions: []*Expression{{Name: "adminApi", Operator: "120", Value: "60"}}, Action: "Block", StatusCode: 429, Reason: "Protect sensitive admin APIs from burst traffic", IsVerbose: true},
	}
}

func getBuiltInWorkflows() []*Workflow {
	createdTime := util.GetCurrentTime()

	return []*Workflow{
		{Owner: "built-in", Name: "workflow-built-in-access-review", DisplayName: "Built-in Access Review", Description: "Standard access review workflow for sensitive platform changes.", Department: "dept-built-in-security", Steps: `[{"order":1,"role":"role-built-in-readonly","action":"Collect change context","timeout_hours":24},{"order":2,"role":"role-built-in-admin","action":"Approve or reject access change","timeout_hours":48}]`, IsTemplate: true, Version: 1, Metadata: `{}`, CreatedTime: createdTime, UpdatedTime: createdTime},
		{Owner: "built-in", Name: "workflow-built-in-tenant-onboarding", DisplayName: "Built-in Tenant Onboarding", Description: "Standard tenant onboarding workflow derived from built-in templates.", Department: "dept-built-in-operations", Steps: `[{"order":1,"role":"role-built-in-admin","action":"Review organization template selection","timeout_hours":24},{"order":2,"role":"role-built-in-admin","action":"Provision baseline menus and permissions","timeout_hours":48}]`, IsTemplate: true, Version: 1, Metadata: `{}`, CreatedTime: createdTime, UpdatedTime: createdTime},
	}
}

func getBuiltInAccountItems() []*AccountItem {
	return []*AccountItem{
		{Name: "Organization", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "ID", Visible: true, ViewRule: "Public", ModifyRule: "Immutable"},
		{Name: "Name", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Display name", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "First name", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Last name", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Avatar", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "User type", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Password", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Email", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Phone", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Country code", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Country/Region", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Location", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Address", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Addresses", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Affiliation", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Title", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "ID card type", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "ID card", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "ID card info", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Real name", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "ID verification", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Homepage", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Bio", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Tag", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Language", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Gender", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Birthday", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Education", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Balance", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Balance credit", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Balance currency", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Cart", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Transactions", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Score", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Karma", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Ranking", Visible: true, ViewRule: "Public", ModifyRule: "Self"},
		{Name: "Signup application", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Register type", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Register source", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "API key", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Roles", Visible: true, ViewRule: "Public", ModifyRule: "Immutable"},
		{Name: "Permissions", Visible: true, ViewRule: "Public", ModifyRule: "Immutable"},
		{Name: "Groups", Visible: true, ViewRule: "Public", ModifyRule: "Admin"},
		{Name: "Consents", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "3rd-party logins", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Properties", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		{Name: "Is admin", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		{Name: "Is forbidden", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		{Name: "Is deleted", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		{Name: "Multi-factor authentication", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "MFA items", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "WebAuthn credentials", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Last change password time", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		{Name: "Managed accounts", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Face ID", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "MFA accounts", Visible: true, ViewRule: "Self", ModifyRule: "Self"},
		{Name: "Need update password", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
		{Name: "IP whitelist", Visible: true, ViewRule: "Admin", ModifyRule: "Admin"},
	}
}

func initBuiltInOrganization() bool {
	organization, err := getOrganization("admin", "built-in")
	if err != nil {
		panic(err)
	}

	if organization != nil {
		return true
	}

	organization = &Organization{
		Owner:              "admin",
		Name:               "built-in",
		CreatedTime:        util.GetCurrentTime(),
		DisplayName:        "开轩认证",
		WebsiteUrl:         "https://itestu.cn",
		Favicon:            fmt.Sprintf("%s/img/kx-favicon.svg", conf.GetConfigString("staticBaseUrl")),
		PasswordType:       "bcrypt",
		PasswordOptions:    []string{"AtLeast6"},
		CountryCodes:       []string{"US", "ES", "FR", "DE", "GB", "CN", "JP", "KR", "VN", "ID", "SG", "IN"},
		DefaultAvatar:      fmt.Sprintf("%s/img/casbin.svg", conf.GetConfigString("staticBaseUrl")),
		UserTypes:          []string{},
		Tags:               []string{},
		Languages:          []string{"en", "es", "fr", "de", "ja", "zh", "vi", "pt", "tr", "pl", "uk"},
		InitScore:          2000,
		AccountItems:       getBuiltInAccountItems(),
		EnableSoftDeletion: false,
		IsProfilePublic:    false,
		UseEmailAsUsername: false,
		EnableTour:         true,
		DcrPolicy:          "open",
	}
	_, err = AddOrganization(organization)
	if err != nil {
		panic(err)
	}

	return false
}

func initBuiltInRole() {
	for _, role := range getBuiltInRoles() {
		existingRole, err := getRole(role.Owner, role.Name)
		if err != nil {
			panic(err)
		}
		if existingRole != nil {
			continue
		}

		role.CreatedTime = util.GetCurrentTime()
		_, err = AddRole(role)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInMenu() {
	for _, menu := range getBuiltInMenus() {
		existingMenu, err := getMenu(menu.Owner, menu.Name)
		if err != nil {
			panic(err)
		}
		if existingMenu != nil {
			continue
		}

		menu.CreatedTime = util.GetCurrentTime()
		menu.UpdatedTime = menu.CreatedTime
		_, err = AddMenu(menu)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInUser() {
	user, err := getUser("built-in", "admin")
	if err != nil {
		panic(err)
	}
	if user != nil {
		return
	}

	user = &User{
		Owner:             "built-in",
		Name:              "admin",
		CreatedTime:       util.GetCurrentTime(),
		Id:                util.GenerateId(),
		Type:              "normal-user",
		Password:          "123",
		DisplayName:       "Admin",
		Avatar:            fmt.Sprintf("%s/img/casbin.svg", conf.GetConfigString("staticBaseUrl")),
		Email:             "admin@example.com",
		Phone:             "12345678910",
		CountryCode:       "US",
		Address:           []string{},
		Affiliation:       "Example Inc.",
		Tag:               "staff",
		Score:             2000,
		Ranking:           1,
		IsAdmin:           true,
		IsForbidden:       false,
		IsDeleted:         false,
		SignupApplication: "app-built-in",
		RegisterType:      "Add User",
		RegisterSource:    "built-in/admin",
		CreatedIp:         "127.0.0.1",
		Properties:        make(map[string]string),
	}
	_, err = AddUser(user, "en")
	if err != nil {
		panic(err)
	}
}

func initBuiltInApplication() {
	application, err := getApplication("admin", "app-built-in")
	if err != nil {
		panic(err)
	}

	if application != nil {
		return
	}

	application = &Application{
		Owner:          "admin",
		Name:           "app-built-in",
		CreatedTime:    util.GetCurrentTime(),
		DisplayName:    "开轩认证",
		Category:       "Default",
		Type:           "All",
		Scopes:         []*ScopeItem{},
		Logo:           fmt.Sprintf("%s/img/kx-brand-logo-light.svg", conf.GetConfigString("staticBaseUrl")),
		HomepageUrl:    "https://itestu.cn",
		Organization:   "built-in",
		Cert:           "cert-built-in",
		EnablePassword: true,
		EnableSignUp:   true,
		Providers: []*ProviderItem{
			{Name: "provider_captcha_default", CanSignUp: false, CanSignIn: false, CanUnlink: false, Prompted: false, SignupGroup: "", Rule: "None", Provider: nil},
		},
		SigninMethods: []*SigninMethod{
			{Name: "Password", DisplayName: "Password", Rule: "All"},
			{Name: "Verification code", DisplayName: "Verification code", Rule: "All"},
			{Name: "WebAuthn", DisplayName: "WebAuthn", Rule: "None"},
			{Name: "Face ID", DisplayName: "Face ID", Rule: "None"},
		},
		SignupItems: []*SignupItem{
			{Name: "ID", Visible: false, Required: true, Prompted: false, Rule: "Random"},
			{Name: "Username", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Display name", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Password", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Confirm password", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Email", Visible: true, Required: true, Prompted: false, Rule: "Normal"},
			{Name: "Phone", Visible: true, Required: true, Prompted: false, Rule: "None"},
			{Name: "Agreement", Visible: true, Required: true, Prompted: false, Rule: "None"},
		},
		Tags:          []string{},
		RedirectUris:  []string{},
		TokenFormat:   "JWT",
		TokenFields:   []string{},
		ExpireInHours: 168,
		FormOffset:    2,

		CookieExpireInHours: 720,
	}
	_, err = AddApplication(application)
	if err != nil {
		panic(err)
	}
}

func readTokenFromFile() (string, string) {
	pemPath := "./object/token_jwt_key.pem"
	keyPath := "./object/token_jwt_key.key"
	pem, err := os.ReadFile(pemPath)
	if err != nil {
		return "", ""
	}
	key, err := os.ReadFile(keyPath)
	if err != nil {
		return "", ""
	}
	return string(pem), string(key)
}

func initBuiltInCert() {
	tokenJwtCertificate, tokenJwtPrivateKey := readTokenFromFile()
	cert, err := getCert("admin", "cert-built-in")
	if err != nil {
		panic(err)
	}

	if cert != nil {
		return
	}

	cert = &Cert{
		Owner:           "admin",
		Name:            "cert-built-in",
		CreatedTime:     util.GetCurrentTime(),
		DisplayName:     "Built-in Cert",
		Scope:           "JWT",
		Type:            "x509",
		CryptoAlgorithm: "RS256",
		BitSize:         4096,
		ExpireInYears:   20,
		Certificate:     tokenJwtCertificate,
		PrivateKey:      tokenJwtPrivateKey,
	}
	_, err = AddCert(cert)
	if err != nil {
		panic(err)
	}
}

func initBuiltInLdap() {
	ldap, err := GetLdap("ldap-built-in")
	if err != nil {
		panic(err)
	}

	if ldap != nil {
		return
	}

	ldap = &Ldap{
		Id:         "ldap-built-in",
		Owner:      "built-in",
		ServerName: "BuildIn LDAP Server",
		Host:       "example.com",
		Port:       389,
		Username:   "cn=buildin,dc=example,dc=com",
		Password:   "123",
		BaseDn:     "ou=BuildIn,dc=example,dc=com",
		AutoSync:   0,
		LastSync:   "",
	}
	_, err = AddLdap(ldap)
	if err != nil {
		panic(err)
	}
}

func initBuiltInProvider() {
	providers := []*Provider{
		{
			Owner:       "admin",
			Name:        "provider_captcha_default",
			CreatedTime: util.GetCurrentTime(),
			DisplayName: "Captcha Default",
			Category:    "Captcha",
			Type:        "Default",
		},
		{
			Owner:       "admin",
			Name:        "provider_balance",
			CreatedTime: util.GetCurrentTime(),
			DisplayName: "Balance",
			Category:    "Payment",
			Type:        "Balance",
		},
		{
			Owner:       "admin",
			Name:        "provider_payment_dummy",
			CreatedTime: util.GetCurrentTime(),
			DisplayName: "Dummy Payment",
			Category:    "Payment",
			Type:        "Dummy",
		},
	}

	for _, provider := range providers {
		existingProvider, err := GetProvider(util.GetId("admin", provider.Name))
		if err != nil {
			panic(err)
		}

		if existingProvider != nil {
			continue
		}

		_, err = AddProvider(provider)
		if err != nil {
			panic(err)
		}
	}
}

func initWebAuthn() {
	gob.Register(webauthn.SessionData{})
}

func initBuiltInUserModel() {
	model, err := GetModel("built-in/user-model-built-in")
	if err != nil {
		panic(err)
	}

	if model != nil {
		return
	}

	model = &Model{
		Owner:       "built-in",
		Name:        "user-model-built-in",
		CreatedTime: util.GetCurrentTime(),
		DisplayName: "Built-in Model",
		ModelText: `[request_definition]
r = sub, obj, act

[policy_definition]
p = sub, obj, act

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = g(r.sub, p.sub) && r.obj == p.obj && r.act == p.act`,
	}
	_, err = AddModel(model)
	if err != nil {
		panic(err)
	}
}

func initBuiltInApiModel() bool {
	model, err := GetModel("built-in/api-model-built-in")
	if err != nil {
		panic(err)
	}

	if model != nil {
		return true
	}

	modelText := `[request_definition]
r = subOwner, subName, method, urlPath, objOwner, objName

[policy_definition]
p = subOwner, subName, method, urlPath, objOwner, objName

[role_definition]
g = _, _

[policy_effect]
e = some(where (p.eft == allow))

[matchers]
m = (r.subOwner == p.subOwner || p.subOwner == "*") && \
    (r.subName == p.subName || p.subName == "*" || r.subName != "anonymous" && p.subName == "!anonymous") && \
    (r.method == p.method || p.method == "*") && \
    (keyMatch2(r.urlPath, p.urlPath) || p.urlPath == "*") && \
    (r.objOwner == p.objOwner || p.objOwner == "*") && \
    (r.objName == p.objName || p.objName == "*") || \
    (r.subOwner == r.objOwner && r.subName == r.objName)`

	model = &Model{
		Owner:       "built-in",
		Name:        "api-model-built-in",
		CreatedTime: util.GetCurrentTime(),
		DisplayName: "API Model",
		ModelText:   modelText,
	}
	_, err = AddModel(model)
	if err != nil {
		panic(err)
	}
	return false
}

func initBuiltInPermission() {
	permission, err := GetPermission("built-in/permission-built-in")
	if err != nil {
		panic(err)
	}
	if permission != nil {
		return
	}

	permission = &Permission{
		Owner:        "built-in",
		Name:         "permission-built-in",
		CreatedTime:  util.GetCurrentTime(),
		DisplayName:  "Built-in Permission",
		Description:  "Built-in Permission",
		Users:        []string{"built-in/*"},
		Groups:       []string{},
		Roles:        []string{},
		Domains:      []string{},
		Model:        "built-in/user-model-built-in",
		Adapter:      "",
		ResourceType: "Application",
		Resources:    []string{"app-built-in"},
		Actions:      []string{"Read", "Write", "Admin"},
		Effect:       "Allow",
		IsEnabled:    true,
		Submitter:    "admin",
		Approver:     "admin",
		ApproveTime:  util.GetCurrentTime(),
		State:        "Approved",
	}
	_, err = AddPermission(permission)
	if err != nil {
		panic(err)
	}
}

func initBuiltInDepartments() {
	for _, department := range getBuiltInDepartments() {
		existingDepartment, err := getDepartment(department.Owner, department.Name)
		if err != nil {
			panic(err)
		}
		if existingDepartment != nil {
			continue
		}

		_, err = AddDepartment(department)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInPosts() {
	for _, post := range getBuiltInPosts() {
		existingPost, err := getPost(post.Owner, post.Name)
		if err != nil {
			panic(err)
		}
		if existingPost != nil {
			continue
		}

		_, err = AddPost(post)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInPositions() {
	existingPositions, err := GetPositionsByOwner("built-in")
	if err != nil {
		panic(err)
	}
	existingByRoleName := map[string]bool{}
	for _, position := range existingPositions {
		existingByRoleName[position.RoleName] = true
	}

	for _, position := range getBuiltInPositions() {
		if existingByRoleName[position.RoleName] {
			continue
		}

		_, err = AddPosition(position)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInOrgTemplates() {
	for _, template := range getBuiltInOrgTemplates() {
		existingTemplate, err := GetOrgTemplateByName(template.Name)
		if err != nil {
			panic(err)
		}
		if existingTemplate != nil {
			continue
		}

		_, err = AddOrgTemplate(template)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInRules() {
	for _, rule := range getBuiltInRules() {
		existingRule, err := getRule(rule.Owner, rule.Name)
		if err != nil {
			panic(err)
		}
		if existingRule != nil {
			continue
		}

		_, err = AddRule(rule)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInWorkflows() {
	existingWorkflows, err := GetWorkflowsByOwner("built-in")
	if err != nil {
		panic(err)
	}
	existingByName := map[string]bool{}
	for _, workflow := range existingWorkflows {
		existingByName[workflow.Name] = true
	}

	for _, workflow := range getBuiltInWorkflows() {
		if existingByName[workflow.Name] {
			continue
		}

		_, err = AddWorkflow(workflow)
		if err != nil {
			panic(err)
		}
	}
}

func initBuiltInUserAdapter() {
	adapter, err := GetAdapter("built-in/user-adapter-built-in")
	if err != nil {
		panic(err)
	}

	if adapter != nil {
		return
	}

	adapter = &Adapter{
		Owner:       "built-in",
		Name:        "user-adapter-built-in",
		CreatedTime: util.GetCurrentTime(),
		Table:       "casbin_user_rule",
		UseSameDb:   true,
	}
	_, err = AddAdapter(adapter)
	if err != nil {
		panic(err)
	}
}

func initBuiltInApiAdapter() {
	adapter, err := GetAdapter("built-in/api-adapter-built-in")
	if err != nil {
		panic(err)
	}

	if adapter != nil {
		return
	}

	adapter = &Adapter{
		Owner:       "built-in",
		Name:        "api-adapter-built-in",
		CreatedTime: util.GetCurrentTime(),
		Table:       "casbin_api_rule",
		UseSameDb:   true,
	}
	_, err = AddAdapter(adapter)
	if err != nil {
		panic(err)
	}
}

func initBuiltInUserEnforcer() {
	enforcer, err := GetEnforcer("built-in/user-enforcer-built-in")
	if err != nil {
		panic(err)
	}

	if enforcer != nil {
		return
	}

	enforcer = &Enforcer{
		Owner:       "built-in",
		Name:        "user-enforcer-built-in",
		CreatedTime: util.GetCurrentTime(),
		DisplayName: "User Enforcer",
		Model:       "built-in/user-model-built-in",
		Adapter:     "built-in/user-adapter-built-in",
	}

	_, err = AddEnforcer(enforcer)
	if err != nil {
		panic(err)
	}
}

func initBuiltInApiEnforcer() {
	enforcer, err := GetEnforcer("built-in/api-enforcer-built-in")
	if err != nil {
		panic(err)
	}

	if enforcer != nil {
		return
	}

	enforcer = &Enforcer{
		Owner:       "built-in",
		Name:        "api-enforcer-built-in",
		CreatedTime: util.GetCurrentTime(),
		DisplayName: "API Enforcer",
		Model:       "built-in/api-model-built-in",
		Adapter:     "built-in/api-adapter-built-in",
	}

	_, err = AddEnforcer(enforcer)
	if err != nil {
		panic(err)
	}
}

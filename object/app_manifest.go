package object

import (
	"fmt"
	"time"
)

type AppManifest struct {
	Application *Application  `json:"application"`
	Menus       []*Menu       `json:"menus"`
	Roles       []*Role       `json:"roles"`
	Permissions []*Permission `json:"permissions"`
	Groups      []*Group      `json:"groups"`
	Departments []*Department `json:"departments"`
	Posts       []*Post       `json:"posts"`
}

type OnboardResult struct {
	ApplicationCreated bool     `json:"applicationCreated"`
	ApplicationUpdated bool     `json:"applicationUpdated"`
	MenusCreated       int      `json:"menusCreated"`
	RolesCreated       int      `json:"rolesCreated"`
	PermissionsCreated int      `json:"permissionsCreated"`
	GroupsCreated      int      `json:"groupsCreated"`
	DepartmentsCreated int      `json:"departmentsCreated"`
	PostsCreated       int      `json:"postsCreated"`
	Errors             []string `json:"errors"`
}

func OnboardApplication(manifest *AppManifest) (*OnboardResult, error) {
	result := &OnboardResult{}
	now := time.Now().UTC().Format("2006-01-02T15:04:05Z")

	// 1. Application
	if manifest.Application != nil {
		app := manifest.Application
		existing, err := getApplication(app.Owner, app.Name)
		if err != nil {
			return nil, fmt.Errorf("check application: %w", err)
		}
		if existing == nil {
			if app.CreatedTime == "" {
				app.CreatedTime = now
			}
			ok, err := AddApplication(app)
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("add application %s/%s: %v", app.Owner, app.Name, err))
			} else if ok {
				result.ApplicationCreated = true
			}
		} else {
			id := fmt.Sprintf("%s/%s", existing.Owner, existing.Name)
			ok, err := UpdateApplication(id, app, true, "en")
			if err != nil {
				result.Errors = append(result.Errors, fmt.Sprintf("update application %s: %v", id, err))
			} else if ok {
				result.ApplicationUpdated = true
			}
		}
	}

	// 2. Menus
	for _, menu := range manifest.Menus {
		existing, err := getMenu(menu.Owner, menu.Name)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("check menu %s/%s: %v", menu.Owner, menu.Name, err))
			continue
		}
		if existing != nil {
			continue
		}
		if menu.CreatedTime == "" {
			menu.CreatedTime = now
		}
		menu.UpdatedTime = now
		ok, err := AddMenu(menu)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("add menu %s/%s: %v", menu.Owner, menu.Name, err))
		} else if ok {
			result.MenusCreated++
		}
	}

	// 3. Roles
	for _, role := range manifest.Roles {
		existing, err := getRole(role.Owner, role.Name)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("check role %s/%s: %v", role.Owner, role.Name, err))
			continue
		}
		if existing != nil {
			continue
		}
		if role.CreatedTime == "" {
			role.CreatedTime = now
		}
		ok, err := AddRole(role)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("add role %s/%s: %v", role.Owner, role.Name, err))
		} else if ok {
			result.RolesCreated++
		}
	}

	// 4. Permissions
	for _, perm := range manifest.Permissions {
		existing, err := getPermission(perm.Owner, perm.Name)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("check permission %s/%s: %v", perm.Owner, perm.Name, err))
			continue
		}
		if existing != nil {
			continue
		}
		if perm.CreatedTime == "" {
			perm.CreatedTime = now
		}
		ok, err := AddPermission(perm)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("add permission %s/%s: %v", perm.Owner, perm.Name, err))
		} else if ok {
			result.PermissionsCreated++
		}
	}

	// 5. Groups
	for _, group := range manifest.Groups {
		existing, err := getGroup(group.Owner, group.Name)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("check group %s/%s: %v", group.Owner, group.Name, err))
			continue
		}
		if existing != nil {
			continue
		}
		if group.CreatedTime == "" {
			group.CreatedTime = now
		}
		group.UpdatedTime = now
		ok, err := AddGroup(group)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("add group %s/%s: %v", group.Owner, group.Name, err))
		} else if ok {
			result.GroupsCreated++
		}
	}

	// 6. Departments
	for _, dept := range manifest.Departments {
		existing, err := getDepartment(dept.Owner, dept.Name)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("check department %s/%s: %v", dept.Owner, dept.Name, err))
			continue
		}
		if existing != nil {
			continue
		}
		if dept.CreatedTime == "" {
			dept.CreatedTime = now
		}
		dept.UpdatedTime = now
		ok, err := AddDepartment(dept)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("add department %s/%s: %v", dept.Owner, dept.Name, err))
		} else if ok {
			result.DepartmentsCreated++
		}
	}

	// 7. Posts
	for _, post := range manifest.Posts {
		existing, err := getPost(post.Owner, post.Name)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("check post %s/%s: %v", post.Owner, post.Name, err))
			continue
		}
		if existing != nil {
			continue
		}
		if post.CreatedTime == "" {
			post.CreatedTime = now
		}
		post.UpdatedTime = now
		ok, err := AddPost(post)
		if err != nil {
			result.Errors = append(result.Errors, fmt.Sprintf("add post %s/%s: %v", post.Owner, post.Name, err))
		} else if ok {
			result.PostsCreated++
		}
	}

	return result, nil
}

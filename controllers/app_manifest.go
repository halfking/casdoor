package controllers

import (
	"encoding/json"

	"github.com/casdoor/casdoor/object"
)

// OnboardApplication
// @Title OnboardApplication
// @Tag Application API
// @Description onboard an application with its full manifest (menus, roles, permissions, etc.)
// @Param   body    body   object.AppManifest  true  "The application manifest"
// @Success 200 {object} object.OnboardResult The onboard result
// @router /onboard-application [post]
func (c *ApiController) OnboardApplication() {
	var manifest object.AppManifest
	err := json.Unmarshal(c.Ctx.Input.RequestBody, &manifest)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	result, err := object.OnboardApplication(&manifest)
	if err != nil {
		c.ResponseError(err.Error())
		return
	}

	c.ResponseOk(result)
}

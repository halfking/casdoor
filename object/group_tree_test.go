package object

import (
	"testing"
	"github.com/stretchr/testify/assert"
)

func TestConvertToTreeData(t *testing.T) {
	groups := []*Group{
		{Owner: "kaixuan", Name: "group-core", DisplayName: "核心干事会", Type: "Virtual", ParentId: "kaixuan"},
		{Owner: "kaixuan", Name: "group-tech-committee", DisplayName: "技术委员会", Type: "Virtual", ParentId: "group-core"},
		{Owner: "kaixuan", Name: "group-other", DisplayName: "其他小组", Type: "Virtual", ParentId: "kaixuan"},
	}

	tree := ConvertToTreeData(groups, "kaixuan")

	assert.Equal(t, 2, len(tree), "Should have 2 top-level groups under 'kaixuan'")
	
	var coreNode *Group
	for _, node := range tree {
		if node.Key == "group-core" {
			coreNode = node
			break
		}
	}

	assert.NotNil(t, coreNode, "Core group should exist")
	assert.Equal(t, 1, len(coreNode.Children), "Core group should have 1 child (tech committee)")
	assert.Equal(t, "group-tech-committee", coreNode.Children[0].Key)
}

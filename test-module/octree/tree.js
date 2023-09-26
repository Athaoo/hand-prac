function generateMockTreeData(needCount) {
	const flatTree = []
	const nodeStack = []
	let nodeCount = 0

	// Generate the root node
	const rootUUID = generateUUID()
	flatTree.push({ uuid: rootUUID, parentUUID: null })
	nodeStack.push(rootUUID)
	nodeCount++

	while (nodeCount < needCount) {
		const parentUUID = nodeStack.pop()
		const numChildren = Math.min(needCount - nodeCount, Math.floor(Math.random() * 4) + 1)

		for (let i = 0; i < numChildren; i++) {
			const uuid = generateUUID()
			flatTree.push({ uuid, parentUUID })
			nodeStack.push(uuid)
			nodeCount++

			if (nodeCount >= needCount) {
				break
			}
		}
	}

	return flatTree.slice(0, needCount) // Trim to the desired count
}

function generateUUID() {
	// Generate a simple UUID (not cryptographically secure)
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
		const r = (Math.random() * 16) | 0
		const v = c === 'x' ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

function restoreTreeFromFlatData(flatTreeData) {
	const nodeMap = new Map() // 用于存储每个节点的 UUID 和对应的节点对象
	let root = null

	// 首先创建节点对象并建立节点映射
	for (const nodeData of flatTreeData) {
		const { uuid, parentUUID } = nodeData
		const node = { uuid, children: [] }
		nodeMap.set(uuid, node)

		if (parentUUID === null) {
			// 如果 parentUUID 为 null，则为根节点
			root = node
		}
	}

	// 将节点连接起来，构建树结构
	for (const nodeData of flatTreeData) {
		const { uuid, parentUUID } = nodeData
		const node = nodeMap.get(uuid)

		if (parentUUID !== null) {
			const parent = nodeMap.get(parentUUID)
			parent.children.push(node)
		}
	}

	return root // 返回树的根节点
}

let pre = performance.now(),
	now

const flatTree = generateMockTreeData(1000000)
console.log('Flat Tree Data:', flatTree)
now = performance.now()
console.log(`建树用时:`, now - pre, 'ms')

pre = now
const tree = restoreTreeFromFlatData(flatTree)

now = performance.now()
console.log(`恢复树用时:`, now - pre, 'ms')
console.log(`🚀 -> tree:`, tree)

console.log(`🚀 -> JSON.stringify(flatTree):`, JSON.stringify(flatTree))

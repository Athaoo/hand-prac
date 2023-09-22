export const mock1 = generateRandomData(10, 3)
export const mock2 = generateRandomData(10, 4)

export function generateRandomData(length, maxDepth) {
	const data = []

	function generateData(depth, idx) {
		if (depth > maxDepth) {
			return null
		}

		const item = {
			id: `${data.length + 1}-${depth + 1}-${idx}`,
			text: `Item ${data.length + 1}-${depth + 1}-${idx}`,
		}

		if (depth < maxDepth && Math.random() < 0.5) {
			item.children = []
			const numChildren = Math.floor(Math.random() * 5) + 1
			for (let i = 0; i < numChildren; i++) {
				const child = generateData(depth + 1, i)
				if (child) {
					item.children.push(child)
				}
			}
		}

		return item
	}

	while (data.length < length) {
		const item = generateData(0, 0)
		if (item) {
			data.push(item)
		}
	}

	return data
}

function calculateTotalNodes(data) {
	if (!data || data.length === 0) {
		return 0
	}

	let totalNodes = 0

	for (const item of data) {
		totalNodes++ // 每个节点都增加 1

		if (item.children) {
			totalNodes += calculateTotalNodes(item.children) // 递归计算子节点的总数
		}
	}

	return totalNodes
}

const totalDepth = calculateTotalNodes(mock1)
const totalDepth2 = calculateTotalNodes(mock2)

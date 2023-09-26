import { generateRandomTreeListData } from './mock'
import VirsualTree from './list'

const { createTree, createPlugin } = VirsualTree

const checkboxPlugin = (function() {
	const onListCreated = ($list, $root, data) => {
	}

	const customNodePreffix = (data) => {
		if (data.level === 0) {
			return `<input type="checkbox" />`
		} else {
			return ''
		}
	}

	return createPlugin({
		onListCreated,
		customNodePreffix
	})
})()

const root = document.querySelector(`#virListRoot`)
const mock = generateRandomTreeListData(100, 5)
console.log(`🚀 -> mock:`, mock)

const tree = createTree({
	root,
	itemHeight: 20,
}, mock, [checkboxPlugin])

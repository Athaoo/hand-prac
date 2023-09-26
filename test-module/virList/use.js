import { generateRandomTreeListData } from './mock'
import VirsualTree from './list'

const { createTree, createPlugin, defaultPlugins } = VirsualTree


const treeCheckbox = defaultPlugins.createCheckboxPlugin()

const root = document.querySelector(`#virListRoot`)
const mock = generateRandomTreeListData(100, 5)
console.log(`🚀 -> mock:`, mock)

const tree = createTree({
	root,
	itemHeight: 20,
}, mock, [treeCheckbox.plugin])

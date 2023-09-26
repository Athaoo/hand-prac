import { generateRandomTreeListData } from './mock'
import VirsualTree from './list'

const { createTree } = VirsualTree

const root = document.querySelector(`#virListRoot`)
const mock = generateRandomTreeListData(50, 4)
console.log(`🚀 -> mock:`, mock)
const tree = createTree({
	root,
	itemHeight: 20,
}, mock)

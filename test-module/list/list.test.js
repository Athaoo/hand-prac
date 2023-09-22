import List from './list.js'
import { mock, mock2 } from './mock.js'

const { createList, createListTemp } = List
const root = document.createElement('div')

// const list = createList({ root }, mock)
const list = createListTemp({ root }, mock)

test('create root', () => {
	const root = list.getRoot()

	expect(root).toBeDefined()
})

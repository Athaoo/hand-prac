import { provincesMock, foodMockData } from './mock.js'
import Cascader from './cascacder.js'

const { createCascader } = Cascader

const root1 = document.querySelector('#provincesCascaderRoot')
const root2 = document.querySelector('#foodCascaderRoot')

const cas1 = createCascader({ root: root1 }, provincesMock, [0, 1])
const cas2 = createCascader({ root: root2 }, foodMockData, [0, 1])

// 遍历对象keys的方法

// 1. 可迭代/不可迭代属性
// 2. 是否可以查到Symbol类型的

const obj = {
  a: 'a',
  b: 'b',
  [Symbol('c')]: 'c',
  1: 1,
  2: 2,
  3: 3
}

// 1. 可迭代

// 1.1 for in
let k1 = []
for (const key in obj) {
  k1[key] = obj[key]
}
console.log(`🚀 -> k1:`, k1)


// 1.2 Object.getxx系列
let k2 = Object.getOwnPropertyNames(obj)
console.log(`🚀 -> k2:`, k2)

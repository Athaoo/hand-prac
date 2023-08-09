const arr1 = [1, 2, 3, 4, 4, 4, 5, 5, 6, 7, 8, 9]
const arr2 = [1, 2, [...arr1], [1, 2, 3, [...arr1], [4, 5, 6, [...arr1]]]]
import { flat2, flat1 } from '../algo/uniqueFlat.js'


// console.log(`🚀 -> flat2(arr2):`, flat2(arr2))
// console.log(`🚀 -> flat1(arr2):`, flat1(arr2))
// console.log('flat api', Array.prototype.flat.call(arr2, 3))

arr1.some(v => v * 2 == 8)
console.log(`🚀 -> arr1.some(v => v * 2 == 8):`, arr1.some(v => v * 2 == 8))
console.log(`🚀 -> arr2.some(v => v * 2 == 8):`, arr2.some(v => v * 2 == 8))


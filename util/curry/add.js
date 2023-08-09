export function add1(...nums) {
	const _add = (...nums1) => add1(...nums, ...nums1)

	_add.value = () => {
		return [...nums].reduce((sum, v) => sum + v, 0)
	}

	return _add
}


const test = () => {
  console.log(`🚀 -> test -> add1(1,2,3):`, add1(1,2,3)(4)(5).value())
}


test()
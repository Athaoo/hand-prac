const arr1 = [1, 2, 3, 12, 6, 4, 5, 5, 6, 7, 8, 9]

function binarySearchImpl(arr, target, left, right) {
	if (left > right) return null
	if (left == right) return arr[left] === target ? left : null

	const mid = (left + right) >> 1

	const leftRes = binarySearchImpl(arr, target, left, mid)
	if (leftRes !== null) return leftRes

	const rightRes = binarySearchImpl(arr, target, mid, right)
	if (rightRes !== null) return rightRes
}

export function binarySearch(arr, target) {
	const left = 0,
		right = arr.length

	return binarySearchImpl(arr, target, 0, arr.length)
}

const test = () => {
	binarySearch(arr1, 12)
	console.log(`🚀 -> test -> binarySearch(arr1, 12):`, binarySearch(arr1, 12))
}

test()

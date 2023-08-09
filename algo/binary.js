const arr1 = [1, 2, 3, 12, 6, 4, 5, 5, 6, 7, 8, 9]

export function binary(arr, target) {
	let left = 0,
		right = arr.length - 1

	while (left <= right) {
		const mid = Math.floor((left + right) / 2)
		// const mid = Math.floor((left + (right - left)) >> 1)
		console.log(`🚀 -> binary -> arr[mid]:`, mid, arr[mid])
		if (arr[mid] == target) {
			return mid
		} else if (arr[mid] < target) {
			left = mid + 1
		} else if (arr[mid] > target) {
			right = mid - 1
		}
	}

	return null
}

const test = () => {
	arr1.sort((a, b) => a - b)
	console.log(`🚀 -> test:`, binary(arr1, 12))
}

test()

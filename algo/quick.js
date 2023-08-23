const quickSort = (arr) => {
	const findIndex = partition

	partial(arr, 0, arr.length - 1)

	return arr

	function partial(arr, left, right) {
		if (left > right) return
		const split = findIndex(arr, left, right)
		partial(arr, left, split - 1)
		partial(arr, split + 1, right)
	}
}

const quickSort2 = (arr) => {
	const findIndex = partitionMidPivot

	partial(arr, 0, arr.length - 1)

	return arr

	function partial(arr, left, right) {
		if (left > right) return
		const split = findIndex(arr, left, right)
		partial(arr, left, split - 1)
		partial(arr, split + 1, right)
	}
}



function partition(arr, low, high) {
	const pivot = arr[low]

	let i = low,
		j = high

	while (i < j) {
		while (arr[j] >= pivot && i < j) {
			j--
		}

		while (arr[i] <= pivot && i < j) {
			i++
		}

		if (i < j) {
			swap(arr, i, j)
		}
	}
  arr[low] = arr[i]
  arr[i] = pivot

	return i
}

function partitionMidPivot(arr, low, high) {
  const mid = Math.floor((high + low) / 2)
  swap(arr, mid, low)

	const pivot = arr[low]

	let i = low,
		j = high

	while (i < j) {
		while (arr[j] >= pivot && i < j) {
			j--
		}

		while (arr[i] <= pivot && i < j) {
			i++
		}

		if (i < j) {
			swap(arr, i, j)
		}
	}
  arr[low] = arr[i]
  arr[i] = pivot

	return i
}

function swap(arr, i, j) {
	const temp = arr[i]
	arr[i] = arr[j]
	arr[j] = temp
}

function test() {
	const arr1 = [23, 45, 12, 56, 34, 78, 9, 15, 67, 98, 1, 8, 55, 33, 21, 76, 88, 44, 3, 66]

	const arr3 = [32, 4, 19, 14, 6, 27, 8, 11, 16, 23, 5, 9, 18, 3, 21, 7, 1, 10, 25, 12]

	const arr2 = [5, 17, 10, 14, 20, 8, 3, 16, 6, 19, 12, 9, 11, 18, 7, 1, 4, 13, 2, 15]

	quickSort2(arr1)
	console.log(`🚀 -> test -> quickSort(arr1):`, arr1)
	quickSort2(arr2)
	console.log(`🚀 -> test -> quickSort(arr2):`, arr2)
	quickSort2(arr3)
	console.log(`🚀 -> test -> quickSort(arr3):`, arr3)
}

test()

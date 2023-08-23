export function createHeap(arr) {
  let heap = build(arr)

  function build(arr) {
    const len = arr.length - 1
    const half = len / 2
    arr = arr.slice(0)

    for (let i = half; i >= 0; i--) {
      heapify(arr, len, i)
    }

    return arr
  }

  function heapify(arr, len, i) {
    const l = i << 1 + 1, r = i << 1 + 2
    let max = i

    l <= len && arr[l] > arr[max] && (max = l)
    r <= len && arr[r] > arr[max] && (max = r)

    if (max != i) {
      swap(arr, i, max)
      heapify(arr, len, l)
      heapify(arr, len, r)
    }
  }

  function sort() {
    const last = heap.length - 1

    for (let i = last; i > 0; i--) {
      swap(heap, 0, i)
      heapify(heap, i - 1, 0)
    }
    return heap
  }

  return {
    sort
  }
}

function swap(arr, i, j) {
	const temp = arr[i]
	arr[i] = arr[j]
	arr[j] = temp
}


function test() {
  const arr1 = [23, 45, 12, 56, 34, 78, 9, 15, 67, 98, 1, 8, 55, 33, 21, 76, 88, 44, 3, 66]

  const heap = createHeap(arr1)
  console.log(`🚀 -> test -> heap.sort():`, heap.sort())
}

test()
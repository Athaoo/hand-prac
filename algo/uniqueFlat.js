export function unique1(arr) {
  if (!typeof arr[Symbol.iterator] == 'function') throw Error('not iteratable')

  return [...new Set(arr)]
}

export function unique2(arr) {
  if (!typeof arr[Symbol.iterator] == 'function') throw Error('not iteratable')

  const hash = new Map()
  const res = []
  for (const item of arr) {
    if (!hash.has(item)) {
      res.push(arr)
      hash.set(item, true)
    }
  }

  return res
}

export function flat1(arr) {
  if (!arr instanceof Array) throw Error('not array')

  const res = []
  for (const item of arr) {
    if (item instanceof Array) {
      res.push(...flat1(item))
    } else {
      res.push(item)
    }
  }

  return res
}


export function flat2(arr) {
  if (!arr instanceof Array) throw Error('not array')

  return Array.prototype.flat.call(arr, 999)
}

// 还有reduce版本

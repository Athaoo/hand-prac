export function generateRandomTreeListData(length, maxDepth) {
  const data = []

  function generateData(depth, idx, parentId) {
    if (depth > maxDepth) {
      return null
    }

    const key = `${parentId}${parentId !== '' ? '-' : ''}${idx}`
    const item = {
      key,
      title: `Item ${key}`,
    }

    if (depth < maxDepth && Math.random() < 0.5) {
      item.children = []
      const numChildren = Math.floor(Math.random() * 5) + 1
      for (let i = 0; i < numChildren; i++) {
        const child = generateData(depth + 1, i, key)
        if (child) {
          item.children.push(child)
        }
      }
    }

    return item
  }

  for (let i = 0; i < length; i++) {
    const item = generateData(0, i, '')
    if (item) {
      data.push(item)
    }
  }

  return data
}
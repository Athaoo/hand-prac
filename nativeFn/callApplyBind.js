export const myCall = (cb, obj,...args) => {
  const key = Symbol()
  obj[key] = cb
  const res = obj[key](...args)
  delete obj[key]
  return res
}

export const myApply = (cb, obj, [...args]) => {
  const key = Symbol()
  obj[key] = cb
  const res = obj[key](...args)
  delete obj[key]
  return res
}

export const myBind = (cb, obj, ...args) => {
  const key = Symbol()
  return () => {
    obj[key] = cb
    const res = obj[key](...args)
    delete obj[key]
    return res
  }
}
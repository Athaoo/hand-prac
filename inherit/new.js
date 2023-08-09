function myNew(foo, ...args) {
  const obj = Object.create(foo.prototype)

  const res = foo.call(obj, ...args)

  return typeof res instanceof Object ? temp : obj
}
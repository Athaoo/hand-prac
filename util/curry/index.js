function baseAdd(num1, num2, num3) {
	return num1 * num2 * num3
}

const currify = (fn, ...args1) => {
	return (...args) => {
		const newArgs = [...args1, ...args]
		if (newArgs.length >= fn.length) {
			return fn(...newArgs)
		} else {
			return currify(fn, ...newArgs)
		}
	}
}

export const curry = (fn, ...args) => {
  args.length >= fn.length
   ? fn(...args)
   : (...nextArgs) => curry(fn, ...args, ...nextArgs)
}

function test() {
	const curryAdd = currify(baseAdd)
	const curryAdd1 = currify(baseAdd, 3)
	const curryAdd2 = currify(baseAdd, 4, 4, 4)

	console.log(`🚀 -> test -> curryAdd(1)(2)(3):`, curryAdd(1)(2)(3))
	console.log(`🚀 -> test -> curryAdd1():`, curryAdd1(4)(5))
  console.log(`🚀 -> test -> curryAdd2():`, curryAdd2())
}

test()

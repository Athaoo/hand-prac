function compose(middleware) {
	return function (context, next) {
		let index = -1

		return dispatch(0)
		function dispatch(i) {
			if (i <= index) throw Error(`Dulplicated run`)

			index = i

			let fn = middleware[i]
			if (index === middleware.length) fn = next

			if (!fn) return Promise.resolve()

			try {
				return Promise.resolve(fn(context, dispatch.bind(null, i + 1)))
			} catch (e) {
				return Promise.reject(e)
			}
		}
	}
}

async function m1(fn, next) {
	console.log(`m1 req`)

	await next()

	console.log(`m1 res`)
}

async function m2(fn, next) {
	console.log(`m2 req`)

	await next()

	console.log(`m2 res`)
}

async function m3(fn, next) {
	console.log(`m3 req`)

	await next()

	console.log(`m3 res`)
}

const run = compose([m1, m2, m3])
run().catch((e) => console.log(e))

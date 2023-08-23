export const createTask = (s, t = () => {}) => {
	return new Promise((r) => {
		setTimeout(() => {
			console.log(`task run ${s} s`)
			r(s)
			t instanceof Function && t()
		}, s * 1000)
	})
}

async function test() {
	console.log('test start')

	await test1()

	test2()
}

function test1() {
	console.log('test1')
}

async function test2() {
	console.log('test2')
}

function test3() {
	console.log('test3')
}

test()

test3()
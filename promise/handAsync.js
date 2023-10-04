import { createTask } from './test.js'

function* generatorTask() {
	console.log(
		`🚀 -> file: handAsync.js:5 -> function*generatorTask -> 'start gen':`,
		'start gen',
	)
	yield createTask(1)
	yield createTask(2)
}

const gen = generatorTask()
const task = Promise.resolve()
	.then(() => {
		const res = gen.next()
		console.log(`🚀 -> file: handAsync.js:12 -> .then -> res:`, res)
		return res.value
	})
	.then(() => {
		const res = gen.next()
		console.log(`🚀 -> file: handAsync.js:17 -> .then -> res:`, res)
	})

function wrapGen(fn) {
	return (...args) =>
		new Promise((resolve, reject) => {
			// args是容易漏掉的部分
			const gen = fn(...args)

			function _next(val) {
				step(gen, resolve, reject, _next, _throw, 'next', val)
			}

			function _throw(err) {
				step(gen, resolve, reject, _next, _throw, 'throw', err)
			}

			_next(null)

			/**
			 *
			 * @param {*} gen
			 * @param {*} resolve
			 * @param {*} reject
			 * @param {*} _next
			 * @param {*} _throw
			 * @param {'next'|'throw'} key
			 * @param  {...any} args
			 */
			function step(gen, resolve, reject, _next, _throw, key, ...args) {
				let info, value
				try {
					// next或是throw
					info = gen[key](...args)
					value = info.value
				} catch (e) {
					reject(e)
					return
				}

				if (info.done) {
					resolve(value)
				} else {
					// 隐藏了几个类型
					// 1. 非promise，直接next了
					// 2. pending，那么_next和_throw会在value异步结束pending后挂载到微任务队列
					// 3. 非pending的promise，fullfilled时_next，rejected的_throw
					Promise.resolve(value).then(_next, _throw)
				}
			}
		})
}

function* genTask() {
	const a = yield createTask(1)
	const b = yield createTask(2)
	const c = yield createTask(3)
}

const executor = wrapGen(genTask)

function wrapGen2(fn) {
	// 第一次漏掉了args1
	return (...args1) => {
		return new Promise((resolve, reject) => {
			const gen = fn(...args1)
			step(null)

			function step(ifNext, ...args) {
				let value, data
				try {
					data = gen[`${ifNext} ? 'next' : 'throw'`](...args)
					value = data.value
				} catch (e) {
					reject(e)
				}

				if (data.done) {
					resolve(data.value)
				} else {
					Promise.resolve(value).then(
						(val) => step(true, val),
						(reason) => step(false, reason),
					)
				}
			}
		})
	}
}

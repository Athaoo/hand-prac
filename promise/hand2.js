const PENDING = 'pending'
const FULLFILLED = 'fullfilled'
const REJECTED = 'rejected'

/**
 * resolve和reject是promise的
 * @param {*} promise
 * @param {*} x
 * @param {*} resolve
 * @param {*} reject
 */
function resolvePromise(promise, x, resolve, reject) {
	if (promise === x) {
		reject(new TypeError(`禁止循环调用`))
	} else if (x instanceof MyPromise) {
		if (x.status === PENDING) {
			x.then(
				(val) => {
					resolvePromise(promise, val, resolve, reject)
				},
				(reason) => {
					reject(reason)
				},
			)
		} else {
			x.then(resolve, reject)
		}
	} else {
		if ((typeof x === 'object' && x !== null) || typeof x === 'function') {
			// 处理thenable类型
			let called = false
			try {
				const then = x.then
				if (typeof then === 'function') {
					then.call(
						x,
						(val) => {
							if (called) {
								return
							}
							called = true
							resolvePromise(proimse, val, resolve, reject)
						},
						(reason) => {
							if (called) {
								return
							}
							called = true
							reject(reason)
						},
					)
				} else {
					// 对象/函数，但非thenable
					resolve(x)
				}
			} catch (e) {
				// 取值then时或其他时间报错
				if (called) {
					return
				}
				called = true
				reject(e)
			}
		} else {
			// 普通的值
			resolve(x)
		}
	}
}

class MyPromise {
	constructor(executor) {
		this.status = 'pending'
		this.value = undefined
		this.reason = undefined

		// 队列的原因是因为同一个promise可以注册多个then
		this.onFullfilledCbs = []
		this.onRejectedCbs = []

		const resolve = (value) => {
			if (this.status === PENDING) {
				this.status = FULLFILLED
				this.value = value
				this.onFullfilledCbs.forEach((cb) => {
					cb(value)
				})
			}
		}

		const reject = (reason) => {
			if (this.status === PENDING) {
				this.status = REJECTED
				this.reason = reason
				this.onRejectedCbs.forEach((cb) => {
					cb(reason)
				})
			}
		}

		try {
			executor(resolve, reject)
		} catch (e) {
			reject(e)
		}
	}

	// 必须返回一个promise以then链式调用
	then(onFullfilled, onRejected) {
		let p, _resolve, _reject
		onFullfilled = typeof onFullfilled === 'function' ? onFullfilled : (v) => v
		onRejected =
			typeof onRejected === 'function'
				? onRejected
				: (r) => {
						throw r
				  }

		const onFullfilledCb = () => {
			setTimeout(() => {
				try {
					const x = onFullfilled(this.value)
					resolvePromise(p, x, resolve, reject)
				} catch (e) {
					_reject(e)
				}
			})
		}

		const onRejectedCb = () => {
			setTimeout(() => {
				try {
					const x = onRejected(this.reason)
					resolvePromise(p, x, resolve, _reject)
				} catch (e) {
					_reject(e)
				}
			})
		}

		p = new MyPromise((resolve, reject) => {
      _resolve = resolve
      _reject = reject

      if (this.status === PENDING){
				this.onFullfilledCbs.push(onFullfilledCb)
				this.onRejectedCbs.push(onRejectedCb)
			}

			if (this.status === FULLFILLED) {
				if (typeof onFullfilled === 'function') {
					onFullfilledCb()
				} else {
					resolve(this.value)
				}
			}

      if (this.status === REJECTED) {
				if (typeof onRejected === 'function') {
					onRejectedCb()
				} else {
					reject(this.reason)
				}
			}
		})

		return p
	}
}

new MyPromise((resolve, reject) => {
	console.log('sync')
	setTimeout(() => {
		console.log('异步任务')
		resolve('惹啊')
	}, 2000)
}).then((v) => {
	console.log(`🚀 -> file: hand2.js:70 -> newMyPromise -> v:`, v)
	console.log('onFullfilled')
})

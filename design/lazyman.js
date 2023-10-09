/**
 * 1. 链式调用
 * 2. 结束调用后确定任务队列顺序启动(toString? valueOf?)
 */

class LazyManImpl {
	constructor(name = '') {
		this.name = name
		this.queue = []
		this.executing = null
		this.enqueue(() => console.log(`Hi this is ${name}!`))
		this.run()
	}

	sleep(second) {
		this.enqueue(
			() =>
				new Promise((resolve) => {
					setTimeout(() => {
						console.log(`Wake up after ${second}`)
						resolve(second)
					}, second * 1000)
				}),
		)
		return this
	}

	sleepFirst(second) {
		this.enqueueFirst(
			() =>
				new Promise((resolve) => {
					setTimeout(() => {
						console.log(`Wake up after ${second}`)
						resolve(second)
					}, second * 1000)
				}),
		)
		return this
	}

	eat(type) {
		this.enqueue(
			() =>
				new Promise((resolve) => {
					setTimeout(() => {
						console.log(`Eat ${type}~~`)
						resolve(type)
					}, 0)
				}),
		)
		return this
	}

	enqueueFirst(task) {
		this.queue.unshift(task)
	}

	enqueue(task) {
		this.queue.push(task)
	}

	run() {
		if (!this.queue.length) return
		if (!!this.executing) return

		let t = this.queue[0]
		t = t instanceof Function ? t : () => t
		this.queue.shift()

		const p = Promise.resolve(t())
		this.executing = p

		p.then((val) => {
			this.executing = null

			this.run()
		})
	}
}

const LazyMan = (name) => new LazyManImpl(name)
const lm = LazyMan('hey').sleep(3).eat('dinner').sleep(2).eat('早饭')

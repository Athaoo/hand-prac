import { createTask } from '../promise/test.js'

/**
 * 这个pool是一次性全量给出任务的
 * @param {*} tasks
 * @param {*} limit
 * @returns
 */
function createLimitPool(tasks, limit = 5) {
	return async () => {
		if (tasks?.length === undefined) {
			throw new Error(`Invalid iterator`)
		}

		const allTasks = []
		const executing = []
		for (const t of tasks) {
			if (executing.length >= limit) {
				await Promise.race(executing)
			}

			const p = Promise.resolve().then(() => t())
			allTasks.push(p)

			const executor = p.then(() => {
				executing.splice(executing.indexOf(executor), 1)
			})
			executing.push(executor)
		}

		return Promise.all([allTasks])
	}
}

const poolTasks = (num) => {
	return new Array(num).fill(0).map(
		(_, idx) => () =>
			createTask(1, () => {
				console.log(`idx: ${idx}`)
			}),
	)
}
const pool = createLimitPool(poolTasks(20), 3)

pool()

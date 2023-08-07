/**

  实现一个promiseTimeout方法，该方法接收两个参数：第一个参数
  为promise， 第二参数为number类型；该方法的作用为：
  1.若promise在第二个参数给定的的时间内处于pending状态，则
  返回一个rejected的promise,其reason为 new Error(promise
  time out')

  2.若promise在第二个参数给定的的时间内处于非pending状态，
  则返回该promise

 */

import { createTask } from './test.js'

class ErrorTimeOutMe extends Error {
	constructor(msg) {
		super(msg)
    this.name = 'timeout'
	}
}

async function promiseTimeout(p, number) {
	try {
		await Promise.race([
			p,
			new Promise((resolve, reject) => {
				setTimeout(() => {
					reject(new ErrorTimeOutMe())
				}, number * 1000)
			}),
		])
	} catch (e) {
		console.log(`🚀 -> file: timeout.js:33 -> promiseTimeout -> e:`, e)
		if (e instanceof ErrorTimeOutMe) {
			return Promise.reject('promise timeout')
		}
	}
}

const test = () => {
	const p1 = createTask(1)
	const p2 = createTask(2.5)
	const pt1 = promiseTimeout(p1, 2).catch((e) => console.log(e))
	const pt2 = promiseTimeout(p2, 2).catch((e) => console.log(e))
}

export default test

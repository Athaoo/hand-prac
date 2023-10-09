// const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// const subFlow = createFlow([() => delay(1000).then(() => console.log("c"))]);

// createFlow([
//   () => console.log("a"),
//   () => console.log("b"),
//   subFlow,
//   [() => delay(1000).then(() => console.log("d")), () => console.log("e")],
// ]).run(() => {
//   console.log("done");
// });

// 需要按照 a,b,延迟1秒,c,延迟1秒,d,e, done 的顺序打印

import { createTask } from '../promise/test.js'

class Flow {
	constructor(task) {
		this.task = task
	}

  async run(cb) {
    await this.task()

    cb instanceof Function && cb()
  }
}
const runFlow = async (flow) => {
	if (flow instanceof Array) {
		for (const item of flow) {
			await runFlow(item)
		}
	} else if (flow instanceof Function) {
		await runFlow(flow())
	} else if (flow instanceof Flow) {
		await flow.run()
	} else if (flow instanceof Promise) {
		await flow
	} else {
		// static val, do nothing
		return
	}
}

const collectFlow = (flow, list = []) => {
	list.push(() => runFlow(flow))

	return list
}

export const createFlow = (flow) => {
	return new Flow(() => runFlow(collectFlow(flow, [])))
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

const test = () => {
	// 需要按照 a,b,延迟1秒,c,延迟1秒,d,e, done 的顺序打印

	const subFlow = createFlow([() => delay(1000).then(() => console.log('c'))])

	createFlow([
		() => console.log('a'),
		() => console.log('b'),
		subFlow,
		[() => delay(1000).then(() => console.log('d')), () => console.log('e')],
	]).run(() => {
		console.log('done')
	})
}

const test2 = () => {
	const subFlow = createFlow([() => createTask(1, () => console.log('c'))])

	createFlow([
		() => console.log('a'),
		() => console.log('b'),
		subFlow,
		[() => createTask(1, () => console.log('d')), () => console.log('e')],
	]).run(() => {
		console.log('done')
	})
}

test2()

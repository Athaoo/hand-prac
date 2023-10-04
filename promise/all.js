const all = function (pList) {
	return new Promise((resolve, reject) => {
		if (!pList instanceof Array) {
			return Promise.resolve()
		}

		const len = pList.length
		const overList = []

		const push = (v) => {
			overList.push(v)
			console.log(`🚀 -> push -> overList.length:`, overList.length)
			if (overList.length == len) {
				resolve(overList)
				console.log(`🚀 -> push -> overList:`, overList)
			}
		}

		for (const p of pList) {
			Promise.resolve(p)
				.then((v) => push(v))
				.catch((e) => reject(e))
		}
	}).catch((e) => {
		throw e
	})
}
const cp = (s) => {
	return new Promise((r) => {
		setTimeout(() => {
			console.log(s, 's')
			r(s)
		}, s * 1000)
	})
}

const all2 = function (pList) {
	return new Promise((resolve, reject) => {
		if (pList?.length === undefined) {
			reject(new Error(`Invalid iterator`))
		}

		const res = [],
			len = pList.length
		let done = 0

		for (let i = 0; i < pList; i++) {
			const p = pList[i]
			if (p instanceof Promise) {
				p.then((val) => {
					res[i] = val
					done++
					if (done === len) {
						resolve(done)
					}
				}, reject)
			} else {
				resolve(p)
			}
		}
	})
}

// all([cp(5), cp(4), cp(2), 'sync1', 'sync2', cp(1), cp(2.5)])
all2([cp(5), cp(4), cp(2), 'sync1', 'sync2', cp(1), cp(2.5)])

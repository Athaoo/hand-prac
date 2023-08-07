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

all([cp(5), cp(4), cp(2), 'sync1', 'sync2', cp(1), cp(2.5)])

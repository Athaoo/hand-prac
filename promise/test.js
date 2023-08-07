export const createTask = (s) => {
	return new Promise((r) => {
		setTimeout(() => {
			console.log(`task run ${s} s`)
      r(s)
		}, s * 1000)
	})
}
export const createTask = (s, t = () => {}) => {
	return new Promise((r) => {
		setTimeout(() => {
			console.log(`task run ${s} s`)
      r(s)
			t instanceof Function && t()
		}, s * 1000)
	})
}
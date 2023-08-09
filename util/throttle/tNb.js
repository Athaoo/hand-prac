export function throttle(fn, ms) {
	let last = Date.now()

	const cb = (...args) => {
		const now = Date.now()
    const sub = now - last
    last = now

		if (sub > ms) {
			return fn.call(this, ...args)
		}
	}

	return cb
}

export function debounce(fn, ms) {
	let last = Date.now()
  let timer = null

	const cb = (...args) => {
    if (timer) {
      clearTimeout(timer)
    }

    const now = Date.now()
    setTimeout(() => {
      cb(...args)
      timer = null
    }, ms)
	}

	return cb
}

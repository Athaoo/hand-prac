const m = new Map([
	[1, 2],
	[2, 22],
	[3, 32],
	[4, 43],
])

const keys = m.keys()
keys.next()
console.log(`🚀 -> file: lru.js:8 -> keys.next():`, keys.next())

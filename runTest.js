import testPromiseTimeout from './promise/timeout.js'

// testPromiseTimeout()


class A {
  constructor() {
    this.event2 = {
      b: 2
    }
  }
  event = {
    a: 1
  }
}

A.prototype.event.a = 2
console.log(`🚀 -> A:`, A)

class A {
  constructor() {
    this.a = 1
  }

  b = {
    v: 2
  }
}

A.prototype.c = {
  v: 3
}

const a = new A()
console.log(`🚀 -> A:`, A)
console.log(`🚀 -> a:`, a)

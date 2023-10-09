class A {
  constructor() {
    this.a = 'a'
  }

  fnA() {}
}

class B {
  constructor() {
    this.b = 'b'
  }

  fnB() {}
}

// 寄生组合
function inhe(class1, class2) {
  class1.prototype = Object.create(class2.prototype)

  class1.constructor = class1
}

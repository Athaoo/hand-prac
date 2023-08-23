function _Promise(fn) {
  let status = 'pending'
  let cbs = []

  // 只是注册
  this.then = function(onFullfilled, onRejected) {
    cbs.push(onFullfilled)
    return this
  }

  function handle(callback) {
    if ()
  }

  function resolve(value) {
    status = 'fullfilled'
    setTimeout(() => {
      // 实际上是加入到micro queue里
      cbs.forEach(cb => cb(value))
    }, 0)

    return this
  }

  function reject() {

  }

  fn(resolve, reject)
}

const p = new Promise((resolve, reject) => {
  setTimeout(() => {
    console.log('task')
    resolve()
  }, 1000)
}).then(() => {
  console.log('over')
})


/**
 * promise A+
 * 状态转换不可逆
 * 异步
 */
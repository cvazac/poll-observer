const test = require('tape')
const AsyncWatcher = require('../../src/async-watcher')
const OrderAsserter = require('../utils/order-asserter')
const isNative = require('../utils/native')

test('setTimeout', function(t) {
  const longDelay = 100, shortDelay = 10, orderAsserter = OrderAsserter.init(t)

  t.ok(isNative(setTimeout))
  const asyncWatcher = AsyncWatcher.init().register('setTimeout', function (ctx, delay) {
    orderAsserter.assert([[1, delay === longDelay], [3, delay === shortDelay]])
    ctx.delay = delay
  }).before('setTimeout', function (ctx) {
    orderAsserter.assert([[5, ctx.delay === shortDelay], [8, ctx.delay === longDelay]])
  }).after('setTimeout', function (ctx) {
    orderAsserter.assert([[7, ctx.delay === shortDelay], [10, ctx.delay === longDelay]])
  })
  t.notOk(isNative(setTimeout))

  orderAsserter.assert(0)
  setTimeout(function () {
    orderAsserter.assert(9, arguments.length === 0)
    shutdown()
  }, longDelay)
  orderAsserter.assert(2)
  setTimeout(function () {
    orderAsserter.assert(6, arguments.length === 0)
  }, shortDelay)
  orderAsserter.assert(4)

  function shutdown() {
    const otherAsyncWatcher = AsyncWatcher.init().register('setTimeout', function (ctx, delay) {
    })
    t.notOk(isNative(setTimeout))
    otherAsyncWatcher.destroy()
    t.notOk(isNative(setTimeout))
    asyncWatcher.destroy()
    t.ok(isNative(setTimeout))
    t.end()
  }
})

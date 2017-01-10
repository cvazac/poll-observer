const test = require('tape')
const AsyncWatcher = require('../../src/async-watcher')
const OrderAsserter = require('../utils/order-asserter')
const isNative = require('../utils/native')

test('setTimeout', function(t) {
  const longDelay = 100, shortDelay = 10, orderAsserter = OrderAsserter.init(t)

  t.ok(isNative(setTimeout))

  const asyncWatchers = []
  let count = 0
  for (var i = 0; i < 3; i++) {
    asyncWatchers.push(AsyncWatcher.init().register('setTimeout', function(ctx, delay) {
      t.ok(Object.keys(ctx).length === 0)
      orderAsserter.assert([
        [1, delay === longDelay],
        [2, delay === longDelay],
        [3, delay === longDelay],
        [5, delay === shortDelay],
        [6, delay === shortDelay],
        [7, delay === shortDelay],
      ])
      ctx.delay = delay
    }).before('setTimeout', function(ctx) {
      orderAsserter.assert([
        [9, ctx.delay === shortDelay],
        [10, ctx.delay === shortDelay],
        [11, ctx.delay === shortDelay],
        [16, ctx.delay === longDelay],
        [17, ctx.delay === longDelay],
        [18, ctx.delay === longDelay],
      ])
    }).after('setTimeout', function(ctx) {
      orderAsserter.assert([
        [13, ctx.delay === shortDelay],
        [14, ctx.delay === shortDelay],
        [15, ctx.delay === shortDelay],
        [20, ctx.delay === longDelay],
        [21, ctx.delay === longDelay],
        [22, ctx.delay === longDelay],
      ])

      if (++count === 6) {
        orderAsserter.assert(23)
        asyncWatchers.forEach(function(asyncWatcher) {
          t.notOk(isNative(setTimeout))
          asyncWatcher.destroy()
        })
        t.ok(isNative(setTimeout))
        t.end()
      }

    }))
  }

  t.notOk(isNative(setTimeout))

  orderAsserter.assert(0)
  setTimeout(function() {
    orderAsserter.assert(19, arguments.length === 0)
  }, longDelay)
  orderAsserter.assert(4)
  setTimeout(function() {
    orderAsserter.assert(12, arguments.length === 0)
  }, shortDelay)
  orderAsserter.assert(8)

})

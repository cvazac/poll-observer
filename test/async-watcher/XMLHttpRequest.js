const test = require('tape')
const AsyncWatcher = require('../../src/async-watcher')
const OrderAsserter = require('../utils/order-asserter')
const isNative = require('../utils/native')
const xhr = require('../utils/xhr')

test('XMLHttpRequest', function(t) {
  const longDelay = 200, shortDelay = 100, orderAsserter = OrderAsserter.init(t)

  function assertNative() {
    _assertMethods(t.ok)
  }
  function assertInstrumented() {
    _assertMethods(t.notOk)
  }
  function _assertMethods(testMethod) {
    ['addEventListener', 'send', 'open'].forEach(function (method) {
      testMethod(isNative(XMLHttpRequest.prototype[method]))
    })
  }
  function checkUrl(url, match) {
    return url.indexOf(match) > -1
  }

  assertNative()

  const asyncWatcher = AsyncWatcher.init().register('XMLHttpRequest', function (ctx, url) {
    ctx.url = url
    orderAsserter.assert([[1, checkUrl(ctx.url, 'data1.json')], [3, checkUrl(ctx.url, 'data2.json')]])
  }).before('XMLHttpRequest', function (ctx) {
    orderAsserter.assert([[5, checkUrl(ctx.url, 'data2.json')], [8, checkUrl(ctx.url, 'data1.json')]])
  }).after('XMLHttpRequest', function (ctx) {
    orderAsserter.assert([[7, checkUrl(ctx.url, 'data2.json')], [10, checkUrl(ctx.url, 'data1.json')]])
  })

  assertInstrumented()

  orderAsserter.assert(0)
  xhr('./data1.json?delay=' + longDelay, function(data) {
    t.equal(data.key, 123)
    orderAsserter.assert(9)
    shutdown()
  })
  orderAsserter.assert(2)
  xhr('./data2.json?delay=' + shortDelay, function(data) {
    t.equal(data.key, 456)
    orderAsserter.assert(6)
  })
  orderAsserter.assert(4)

  function shutdown() {
    asyncWatcher.destroy()
    assertNative()
    t.end()
  }
})

const test = require('tape')
const AsyncWatcher = require('../../src/async-watcher')
const OrderAsserter = require('../utils/order-asserter')
const isNative = require('../utils/native')
const xhr = require('../utils/xhr')

function checkUrl(url, match) {
  return url.indexOf(match) > -1
}
function assertNative(t) {
  _assertMethods(t.ok)
}
function assertInstrumented(t) {
  _assertMethods(t.notOk)
}
function _assertMethods(testMethod) {
  ['addEventListener', 'send', 'open'].forEach(function(method) {
    testMethod(isNative(XMLHttpRequest.prototype[method]))
  })
}

test('XMLHttpRequest - addEventListener - loadend', function(t) {
  const orderAsserter = OrderAsserter.init(t)

  assertNative(t)
  const asyncWatcher = AsyncWatcher.init().register('XMLHttpRequest', function(ctx, url) {
    orderAsserter.assert(1, checkUrl(url, 'data1.json'))
    ctx.url = url
  }).before('XMLHttpRequest', function(ctx) {
    orderAsserter.assert(3, checkUrl(ctx.url, 'data1.json'))
  }).after('XMLHttpRequest', function(ctx) {
    orderAsserter.assert(5, checkUrl(ctx.url, 'data1.json'))

    assertInstrumented(t)
    asyncWatcher.destroy()
    assertNative(t)
    t.end()
  })
  assertInstrumented(t)

  orderAsserter.assert(0)
  xhr.loadend('./data1.json', function(data) {
    t.equal(data.key, 123)
    orderAsserter.assert(4)
  })
  orderAsserter.assert(2)
})

test('XMLHttpRequest - onload', function(t) {
  const orderAsserter = OrderAsserter.init(t)

  assertNative(t)
  const asyncWatcher = AsyncWatcher.init().register('XMLHttpRequest', function(ctx, url) {
    orderAsserter.assert(1, checkUrl(url, 'data1.json'))
    ctx.url = url
  }).before('XMLHttpRequest', function(ctx) {
    orderAsserter.assert(3, checkUrl(ctx.url, 'data1.json'))
  }).after('XMLHttpRequest', function(ctx) {
    orderAsserter.assert(5, checkUrl(ctx.url, 'data1.json'))

    assertInstrumented(t)
    asyncWatcher.destroy()
    assertNative(t)
    t.end()
  })
  assertInstrumented(t)

  orderAsserter.assert(0)
  xhr.onload('./data1.json', function(data) {
    t.equal(data.key, 123)
    orderAsserter.assert(4)
  })
  orderAsserter.assert(2)
})

test('XMLHttpRequest - several', function(t) {
  const longDelay = 200, shortDelay = 100, orderAsserter = OrderAsserter.init(t)

  assertNative(t)

  const asyncWatchers = []
  let count = 0
  for (var i = 0; i < 3; i++) {
    asyncWatchers.push(AsyncWatcher.init().register('XMLHttpRequest', function(ctx, url) {
      orderAsserter.assert([
        [1, checkUrl(url, 'data1.json')],
        [2, checkUrl(url, 'data1.json')],
        [3, checkUrl(url, 'data1.json')],
        [5, checkUrl(url, 'data2.json')],
        [6, checkUrl(url, 'data2.json')],
        [7, checkUrl(url, 'data2.json')],
      ])
      ctx.url = url
    }).before('XMLHttpRequest', function(ctx) {
      orderAsserter.assert([
        [9, checkUrl(ctx.url, 'data2.json')],
        [10, checkUrl(ctx.url, 'data2.json')],
        [11, checkUrl(ctx.url, 'data2.json')],
        [16, checkUrl(ctx.url, 'data1.json')],
        [17, checkUrl(ctx.url, 'data1.json')],
        [18, checkUrl(ctx.url, 'data1.json')],
      ])
    }).after('XMLHttpRequest', function(ctx) {
      orderAsserter.assert([
        [13, checkUrl(ctx.url, 'data2.json')],
        [14, checkUrl(ctx.url, 'data2.json')],
        [15, checkUrl(ctx.url, 'data2.json')],
        [20, checkUrl(ctx.url, 'data1.json')],
        [21, checkUrl(ctx.url, 'data1.json')],
        [22, checkUrl(ctx.url, 'data1.json')],
      ])

      if (++count === 6) {
        orderAsserter.assert(23)
        asyncWatchers.forEach(function(asyncWatcher) {
          assertInstrumented(t)
          asyncWatcher.destroy()
        })
        assertNative(t)
        t.end()
      }

    }))
  }

  assertInstrumented(t)

  orderAsserter.assert(0)
  xhr.loadend('./data1.json?delay=' + longDelay, function(data) {
    t.equal(data.key, 123)
    orderAsserter.assert(19)
  })
  orderAsserter.assert(4)
  xhr.loadend('./data2.json?delay=' + shortDelay, function(data) {
    t.equal(data.key, 456)
    orderAsserter.assert(12)
  })
  orderAsserter.assert(8)

})

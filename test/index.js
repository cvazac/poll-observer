const test = require('tape')
const AsyncWatcher = require('../src/async-watcher')
const OrderAsserter = require('./utils/order-asserter')
const isNative = require('./utils/native')
const xhr = require('./utils/xhr')

test('async-watcher', function(t) {
  const orderAsserter = OrderAsserter.init(t)

  function checkUrl(url, match) {
    return url.indexOf(match) > -1
  }

  debugger
  pollObserver.start()
  debugger
  xhr('./data1.json', function(data) {
    //start listener, if any new xhr, loop!
    debugger
    setTimeout(function () {
      debugger
      //start listener
      //nop
      //stop listener
    })
    debugger
  })
  debugger

    /*

    false && setTimeout(function() {
      pollObserver.stop()
    })



    AsyncWatcher.init().register('XMLHttpRequest', function(ctx, url) {
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
          assertInstrumented()
          asyncWatcher.destroy()
        })
        assertNative()
        t.end()
      }

    })
    */



  //orderAsserter.assert(0)
  xhr('./data1.json', function(data) {
    //start listener, if any new xhr, loop!
    xhr('./data2.json', function(data) {
    })
    //stop listening
  })


  xhr('./data1.json', function(data) {
    //start listener, if any new xhr, loop!

    setTimeout(function() {
      //start listener
      //nop
      //stop listener
    })

    setTimeout(function() {
      //start listener
      xhr('./data2.json', function(data) {
      })
      //stop listener
    })
    //stop listening
  })

  Listen.setTimeout(function(listener) {
    listener.before(function() {
    })
    listener.after(function() {
    })
  })




})

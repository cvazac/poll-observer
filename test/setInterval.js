var test = require('tape')
var pollObserver = require('../index')
var utils = require('./utils/utils')
var xhr = utils.xhr
var stamp = utils.stamp

test('setInterval', function(t) {
  pollObserver.start()
  var iteration = 0, start = stamp(), delay = 50, fudge = 10

  var id = setInterval(function() {
    var actualDelay = stamp() - start
    t.ok(actualDelay >= delay - fudge && actualDelay < delay + fudge)
    if (iteration++ > 5) {
      t.end()
      clearInterval(id) // tape will fail if `clearInterval` fails, because `end()` will be called more than once
      return
    }
    start = stamp()
  }, delay)
  pollObserver.stop()
})

test('clearInterval', function(t) {
  pollObserver.start()
  var id = setInterval(function() {
    t.fail()
  })
  clearInterval(id)
  pollObserver.stop()

  setTimeout(function() {
    t.end()
  }, 100)
})

test('setInterval - xhr', function(t) {
  var poll = 1, total = 5
  pollObserver.start(function(xhrs) {
    poll++
    t.ok(poll === xhrs.length)

    for (var i = 0; i < xhrs.length; i++) {
      t.ok(xhrs[i] === './data1.json?iteration=' + (i + 1))
    }

    if (poll === total) {
      t.end()
      pollObserver.stop()
    }
  })

  var iteration = 0
  var x = setInterval(function() {
    if (iteration++ === total) {
      return clearInterval(x)
    }
    xhr('./data1.json?iteration=' + iteration)
  }, 100)
})

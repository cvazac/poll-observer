var test = require('tape')
var pollObserver = require('../index')
var utils = require('./utils/utils')
var xhr = utils.xhr
var stamp = utils.stamp

test('setInterval', function(t) {
  pollObserver.observe()
  var iteration = 0, observe = stamp(), delay = 50, fudge = 10

  var id = setInterval(function() {
    var actualDelay = stamp() - observe
    t.ok(actualDelay >= delay - fudge && actualDelay < delay + fudge)
    if (iteration++ > 5) {
      t.end()
      clearInterval(id) // tape will fail if `clearInterval` fails, because `end()` will be called more than once
      return
    }
    observe = stamp()
  }, delay)
  pollObserver.disconnect()
})

test('clearInterval', function(t) {
  pollObserver.observe()
  var id = setInterval(function() {
    t.fail()
  })
  clearInterval(id)
  pollObserver.disconnect()

  setTimeout(function() {
    t.end()
  }, 100)
})

test('setInterval - xhr', function(t) {
  var poll = 1, total = 5
  pollObserver.observe(function(data) {
    var entries = data.getEntries()
    poll++
    t.ok(poll === entries.length)

    for (var i = 0; i < entries.length; i++) {
      t.ok(entries[i].type === 'poll')
      t.ok(entries[i].url === './data1.json?iteration=' + (i + 1))
    }

    if (poll === total) {
      t.end()
      pollObserver.disconnect()
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

var test = require('tape')
var pollObserver = require('../index')
var stamp = require('./utils/utils').stamp
var testScheduler = require('./utils/schedulers').testScheduler

test('setTimeout', function(t) {
  pollObserver.observe()
  var observe = stamp(), delay = 20, fudge = 10
  setTimeout(function() {
    var actualDelay = stamp() - observe
    t.ok(actualDelay >= delay && actualDelay < delay + fudge)
    t.end()
  }, delay)
  pollObserver.disconnect()
})

testScheduler('setTimeout', 'clearTimeout')

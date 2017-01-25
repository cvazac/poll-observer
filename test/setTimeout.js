var test = require('tape')
var pollObserver = require('../index')
var stamp = require('./utils/utils').stamp
var testScheduler = require('./utils/schedulers').testScheduler

test('setTimeout', function(t) {
  pollObserver.start()
  var start = stamp(), delay = 20, fudge = 10
  setTimeout(function() {
    var actualDelay = stamp() - start
    t.ok(actualDelay >= delay && actualDelay < delay + fudge)
    t.end()
  }, delay)
  pollObserver.stop()
})

testScheduler('setTimeout', 'clearTimeout')

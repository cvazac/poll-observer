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
  var intervalTotal = 5, loops = ['a', 'b', 'c'].map(function (key) {
      var url = './data.json?req=' + key
      return {
        key: key,
        validations: [
          function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 2)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 0)
            t.ok(entries[1].type === 'poll')
            t.ok(entries[1].url === url + 1)
          }, function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 1)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 2)
          }, function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 1)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 3)
          }, function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 1)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 4)
          }
        ]
      }
    }), count = loops.length

  pollObserver.observe(function(data) {
    var validations = loops[data.pollId].validations
    validations.shift()(data)

    if (validations.length === 0 && --count === 0) {
      t.end()
      pollObserver.disconnect()
    }
  })

  loops.forEach(function(loop, index) {
    var url = './data.json?req=' + loop.key
    var iteration = 0
    var x = setInterval(function() {
      if (iteration++ === intervalTotal) {
        return clearInterval(x)
      }
      xhr(url + (iteration - 1))
    }, 100)
  })
})

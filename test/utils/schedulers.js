var test = require('tape')
var pollObserver = require('../../index')
var utils = require('./utils')
var xhr = utils.xhr

module.exports = {
  testScheduler: function(setMethodName, unsetMethodName) {
    test(unsetMethodName, function(t) {
      pollObserver.observe()
      var id = window[setMethodName](function() {
        t.fail()
      })
      window[unsetMethodName](id)
      pollObserver.disconnect()

      setTimeout(function() {
        t.end()
      }, 100)
    })

    test('xhr - ' + setMethodName + ' - xhr', function(t) {
      pollObserver.observe(function(data) {
        t.ok(data.pollId === 0)

        var entries = data.getEntries()
        t.ok(entries.length === 2)
        t.ok(entries[0].type === 'poll')
        t.ok(entries[0].url === './data.json?req=1')
        t.ok(entries[1].type === 'poll')
        t.ok(entries[1].url === './data.json?req=2')
        t.end()
        pollObserver.disconnect()
      })
      xhr('./data.json?req=1', function() {
        window[setMethodName](function() {
          xhr('./data.json?req=2')
        })
      })
    })

    test('xhr - ' + setMethodName + ' - ' + setMethodName + ' - xhr', function(t) {
      pollObserver.observe(function(data) {
        t.ok(data.pollId === 0)

        var entries = data.getEntries()
        t.ok(entries.length === 2)
        t.ok(entries[0].type === 'poll')
        t.ok(entries[0].url === './data.json?req=1')
        t.ok(entries[1].type === 'poll')
        t.ok(entries[1].url === './data.json?req=2')
        t.end()
        pollObserver.disconnect()
      })
      xhr('./data.json?req=1', function() {
        window[setMethodName](function() {
          window[setMethodName](function() {
            xhr('./data.json?req=2')
          })
        })
      })
    })
  }
}

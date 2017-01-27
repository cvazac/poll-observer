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
        var entries = data.getEntries()
        t.ok(entries.length === 2)
        t.ok(entries[0].type === 'poll')
        t.ok(entries[0].url === './data1.json')
        t.ok(entries[1].type === 'poll')
        t.ok(entries[1].url === './data2.json')
        t.end()
        pollObserver.disconnect()
      })
      xhr('./data1.json', function() {
        window[setMethodName](function() {
          xhr('./data2.json')
        })
      })
    })

    test('xhr - ' + setMethodName + ' - ' + setMethodName + ' - xhr', function(t) {
      pollObserver.observe(function(data) {
        var entries = data.getEntries()
        t.ok(entries.length === 2)
        t.ok(entries[0].type === 'poll')
        t.ok(entries[0].url === './data1.json')
        t.ok(entries[1].type === 'poll')
        t.ok(entries[1].url === './data2.json')
        t.end()
        pollObserver.disconnect()
      })
      xhr('./data1.json', function() {
        window[setMethodName](function() {
          window[setMethodName](function() {
            xhr('./data2.json')
          })
        })
      })
    })
  }
}

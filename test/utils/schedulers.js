var test = require('tape')
var pollObserver = require('../../index')
var utils = require('./utils')
var xhr = utils.xhr

module.exports = {
  testScheduler: function(setMethodName, unsetMethodName) {
    test(unsetMethodName, function(t) {
      pollObserver.start()
      var id = window[setMethodName](function() {
        t.fail()
      })
      window[unsetMethodName](id)
      pollObserver.stop()

      setTimeout(function() {
        t.end()
      }, 100)
    })

    test('xhr - ' + setMethodName + ' - xhr', function(t) {
      pollObserver.start(function(xhrs) {
        t.ok(xhrs.length === 2)
        t.ok(xhrs[0] === './data1.json')
        t.ok(xhrs[1] === './data2.json')
        t.end()
        pollObserver.stop()
      })
      xhr('./data1.json', function() {
        window[setMethodName](function() {
          xhr('./data2.json')
        })
      })
    })

    test('xhr - ' + setMethodName + ' - ' + setMethodName + ' - xhr', function(t) {
      pollObserver.start(function(xhrs) {
        t.ok(xhrs.length === 2)
        t.ok(xhrs[0] === './data1.json')
        t.ok(xhrs[1] === './data2.json')
        t.end()
        pollObserver.stop()
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

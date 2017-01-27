var test = require('tape')
var pollObserver = require('../index')
var testScheduler = require('./utils/schedulers').testScheduler

if (window.setImmediate) {
  test('setImmediate', function (t) {
    pollObserver.observe()
    setImmediate(function () {
      t.end()
    })
    pollObserver.disconnect()
  })

  testScheduler('setImmediate', 'clearImmediate')
}

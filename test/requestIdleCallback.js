var test = require('tape')
var pollObserver = require('../index')
var testScheduler = require('./utils/schedulers').testScheduler

if (window.requestIdleCallback) {
  test('requestIdleCallback', function (t) {
    pollObserver.observe()
    requestIdleCallback(function () {
      t.end()
    })
    pollObserver.disconnect()
  })

  testScheduler('requestIdleCallback', 'cancelIdleCallback')
}

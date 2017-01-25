var test = require('tape')
var pollObserver = require('../index')
var testScheduler = require('./utils/schedulers').testScheduler

if (window.requestIdleCallback) {
  test('requestIdleCallback', function (t) {
    pollObserver.start()
    requestIdleCallback(function () {
      t.end()
    })
    pollObserver.stop()
  })

  testScheduler('requestIdleCallback', 'cancelIdleCallback')
}

var test = require('tape')
var pollObserver = require('../index')
var testScheduler = require('./utils/schedulers').testScheduler

if (window.requestAnimationFrame) {
  test('requestAnimationFrame', function (t) {
    pollObserver.observe()
    requestAnimationFrame(function () {
      t.end()
    })
    pollObserver.disconnect()
  })

  testScheduler('requestAnimationFrame', 'cancelAnimationFrame')
}

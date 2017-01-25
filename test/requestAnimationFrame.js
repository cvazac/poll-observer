var test = require('tape')
var pollObserver = require('../index')
var testScheduler = require('./utils/schedulers').testScheduler

if (window.requestAnimationFrame) {
  test('requestAnimationFrame', function (t) {
    pollObserver.start()
    requestAnimationFrame(function () {
      t.end()
    })
    pollObserver.stop()
  })

  testScheduler('requestAnimationFrame', 'cancelAnimationFrame')
}

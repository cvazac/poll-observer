const test = require('tape')
const pollObserver = require('../index')

test('setTimeout', function (t) {
  pollObserver.start()
  setTimeout(function () {
    t.end()
  })
  pollObserver.stop()
})

test('clearTimeout', function (t) {
  pollObserver.start()
  const id = setTimeout(function () {
    t.fail()
  })
  clearTimeout(id)
  pollObserver.stop()

  setTimeout(function () {
    t.end()
  }, 100)
})

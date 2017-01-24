const test = require('tape')
const pollObserver = require('../index')

test('setInterval', function (t) {
  pollObserver.start()
  let count = 0
  const id = setInterval(function () {
    if (count++ > 5) {
      t.end()
      clearInterval(id) // tape will fail if `clearInterval` fails, because `end()` will be called more than once
    }
  })
  pollObserver.stop()
})

test('clearInterval', function (t) {
  pollObserver.start()
  const id = setInterval(function () {
    t.fail()
  })
  clearInterval(id)
  pollObserver.stop()

  setTimeout(function () {
    t.end()
  }, 100)
})

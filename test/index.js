const test = require('tape')
const pollObserver = require('../index')

function fetch(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.addEventListener('loadend', callback)
  xhr.send()
}

test('xhr - xhr', function(t) {
  pollObserver.start(function(xhrs) {
    t.ok(xhrs.length === 2)
    t.ok(xhrs[0] == './data1.json')
    t.ok(xhrs[1] == './data2.json')
    t.end()
    pollObserver.stop()
  })
  fetch('./data1.json', function() {
    fetch('./data2.json')
  })
})

test('xhr - setTimeout - xhr', function(t) {
  pollObserver.start(function (xhrs) {
    t.ok(xhrs.length === 2)
    t.ok(xhrs[0] == './data1.json')
    t.ok(xhrs[1] == './data2.json')
    t.end()
    pollObserver.stop()
  })
  fetch('./data1.json', function () {
    setTimeout(function () {
      fetch('./data2.json')
    })
  })
})

test('xhr - setTimeout - setTimeout - xhr', function(t) {
  pollObserver.start(function (xhrs) {
    t.ok(xhrs.length === 2)
    t.ok(xhrs[0] == './data1.json')
    t.ok(xhrs[1] == './data2.json')
    t.end()
    pollObserver.stop()
  })
  fetch('./data1.json', function () {
    setTimeout(function () {
      setTimeout(function () {
        fetch('./data2.json')
      })
    })
  })
})

test('setInterval - xhr', function(t) {
  var poll = 1, total = 5
  pollObserver.start(function (xhrs) {
    poll++
    t.ok(poll === xhrs.length)

    for (var i = 0; i < xhrs.length; i++) {
      t.ok(xhrs[i] === './data1.json?count=' + (i + 1))
    }

    if (poll === total) {
      t.end()
      pollObserver.stop()
    }
  })

  var count = 0
  var x = setInterval(function() {
    if (count++ == total) {
      return clearInterval(x)
    }
    fetch('./data1.json?count=' + count)
  }, 100)
})

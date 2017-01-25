var test = require('tape')
var pollObserver = require('../index')
var xhr = require('./utils/utils').xhr

test('xhr - xhr', function(t) {
  pollObserver.start(function(xhrs) {
    t.ok(xhrs.length === 2)
    t.ok(xhrs[0] === './data1.json')
    t.ok(xhrs[1] === './data2.json')
    t.end()
    pollObserver.stop()
  })
  xhr('./data1.json', function() {
    xhr('./data2.json')
  })
})

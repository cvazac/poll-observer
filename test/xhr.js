var test = require('tape')
var pollObserver = require('../index')
var xhr = require('./utils/utils').xhr

test('xhr - xhr', function(t) {
  pollObserver.observe(function(data) {
    var entries = data.getEntries()
    t.ok(entries.length === 2)
    t.ok(entries[0].type === 'poll')
    t.ok(entries[0].url === './data1.json')
    t.ok(entries[1].type === 'poll')
    t.ok(entries[1].url === './data2.json')
    t.end()
    pollObserver.disconnect()
  })

  xhr('./data1.json', function() {
    xhr('./data2.json')
  })
})

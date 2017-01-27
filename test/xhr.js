var test = require('tape')
var pollObserver = require('../index')
var xhr = require('./utils/utils').xhr

test('xhr - xhr', function(t) {
  var loops = ['a', 'b', 'c'].map(function (key) {
      var url = './data.json?req=' + key
      return {
        key: key,
        validations: [
          function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 2)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 0)
            t.ok(entries[1].type === 'poll')
            t.ok(entries[1].url === url + 1)
          }, function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 1)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 2)
          }, function (data) {
            var entries = data.getEntries()
            t.ok(entries.length === 1)
            t.ok(entries[0].type === 'poll')
            t.ok(entries[0].url === url + 3)
          }
        ]
      }
    }), count = loops.length

  pollObserver.observe(function(data) {
    var validations = loops[data.pollId].validations
    validations.shift()(data)

    if (validations.length === 0 && --count === 0) {
      t.end()
      pollObserver.disconnect()
    }
  })

  loops.forEach(function(loop) {
    var url = './data.json?req=' + loop.key
    xhr(url + 0, function() {
      xhr(url + 1, function() {
        xhr(url + 2, function() {
          xhr(url + 3)
        })
      })
    })
  })
})

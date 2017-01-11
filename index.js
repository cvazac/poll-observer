var AsyncWatcher = require('./src/async-watcher')

var start, stop
;(function() {
  function PollObserver(types) {
    var watchers = []
    types.forEach(function(type) {
      watchers.push(AsyncWatcher.init().register(type, function(ctx) {
        if (type === 'XMLHttpRequest') {
          return reportLoop()
        }
      }).before(type, function(ctx) {
        ctx.listener = new PollObserver(['XMLHttpRequest', 'setTimeout'])
      }).after(type, function(ctx) {
        ctx.listener && ctx.listener.destroy()
      }))
    })

    this.destroy = function() {
      watchers.forEach(function(watcher) {
        watcher.destroy()
      })
    }
    function reportLoop() {
      console.info('************ loop ************')
    }
  }

  var asyncWatcher
  start = function() {
    asyncWatcher = AsyncWatcher.init().register('XMLHttpRequest', function(ctx) {
      // nop
    }).before('XMLHttpRequest', function(ctx) {
      ctx.listener = new PollObserver(AsyncWatcher.types.all)
    }).after('XMLHttpRequest', function(ctx) {
      ctx.listener && ctx.listener.destroy()
    })
  }
  stop = function() {
    asyncWatcher && asyncWatcher.destroy()
  }
})()

module.exports = {
  start: start,
  stop: stop,
}

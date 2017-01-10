var AsyncWatcher = require('./src/async-watcher')

var start, stop
;(function() {
  function PollObserver(types) {
    debugger
    var watchers = []
    types.forEach(function(type) {
      debugger
      watchers.push(AsyncWatcher.init().register(type, function (ctx) {
        debugger
        if (type === AsyncWatcher.types.XMLHttpRequest) {
          return reportLoop()
        }
        debugger
      }).before(type, function (ctx) {
        debugger
        ctx.listener = new PollObserver(AsyncWatcher.types.all)
        debugger
      }).after(type, function (ctx) {
        debugger
        ctx.listener && ctx.listener.destroy()
        debugger
      }))
    })

    this.destroy = function() {
      //debugger
      watchers.forEach(function(watcher) {
        debugger
        watcher.destroy()
      })
    }
    function reportLoop() {
      debugger
    }
  }

  var asyncWatcher
  start = function() {
    asyncWatcher = AsyncWatcher.init().register(AsyncWatcher.types.XMLHttpRequest, function (ctx) {
      debugger // nop
    }).before(AsyncWatcher.types.XMLHttpRequest, function (ctx) {
      debugger
      ctx.listener = new PollObserver(AsyncWatcher.types.all)
      debugger
    }).after(AsyncWatcher.types.XMLHttpRequest, function (ctx) {
      debugger
      ctx.listener && ctx.listener.destroy()
      debugger
    })
  }
  stop = function() {
    debugger
    asyncWatcher && asyncWatcher.destroy()
  }
})()

module.exports = {
  start: start,
  stop: stop,
}

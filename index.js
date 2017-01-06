
var start, stop
;(function() {
  function PollObserver(types) {
    this.schedulerWatch = AsyncWatchers.on(types).schedule(function(ctx, type) {
      if (type === AsyncWatcher.types.XMLHttpRequest) {
        return reportLoop()
      }
    }).before(function(ctx) {
      ctx.listener = new PollObserver(AsyncWatcher.types.all)
    }).after(function(ctx) {
      ctx.listener && listener.destroy()
    })

    this.destroy = function() {
      this.schedulerWatch.destroy()
    }
  }

  /* AsyncWatchers */
  AsyncWatchers.on = function(types) {
    return new AsyncWatchers(types)
  }

  function AsyncWatchers(types) {
    var watches = []
    for (var i = 0; i < types.length; i++) {
      watches.push(AsyncWatcher.on(types[i]))
    }

    this.schedule = function(callback) {
      forEach('schedule', callback)
      return this
    }
    this.before = function(callback) {
      forEach('before', callback)
      return this
    }
    this.after = function(callback) {
      forEach('after', callback)
      return this
    }
    this.destroy = function() {
      forEach('destroy')
    }

    function forEach() {
      var args = Array.prototype.slice.call(arguments)
      var method = args.shift()
      for (var i = 0; i < watches.length; i++) {
        var watcher = watches[i]
        watcher[method].apply(watcher, args)
      }
    }

    return this
  }



  var pollObserver
  start = function() {
    pollObserver = new PollObserver([AsyncWatcher.types.XMLHttpRequest])
  }
  stop = function() {
    pollObserver && pollObserver.destroy()
  }
})()

module.exports = {
  start: start,
  stop: stop,
}

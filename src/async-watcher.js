var init, types
(function() {
  var key = 0, watchers = [], natives = {}, instrumented = {}

  init = function() {
    return new AsyncWatcher()
  }
  types = {
    setTimeout: 'setTimeout',
    XMLHttpRequest: 'XMLHttpRequest',
  }
  types.all = Object.keys(types)

  function AsyncWatcher() {
    var ownKey = key++

    this.register = function(type, callback) {
      // TODO wrap all callbacks in try/catch
      typeof callback === 'function' && maybeInstrument(type, 'register', callback)
      return this
    }
    this.before = function(type, callback) {
      typeof callback === 'function' && maybeInstrument(type, 'before', callback)
      return this
    }
    this.after = function(type, callback) {
      typeof callback === 'function' && maybeInstrument(type, 'after', callback)
      return this
    }
    this.destroy = destroy

    var instrument = {}
    instrument[types.setTimeout] = function() {
      natives[types.setTimeout] = setTimeout
      window.setTimeout = function(callback, delay) {
        var callbacks = register('setTimeout', delay)
        natives[types.setTimeout].call(this, function() {
          executeCallbacks(callbacks, 'before')
          callback() // TODO try/catch ?
          executeCallbacks(callbacks, 'after')
        }, delay)
      }
    }
    instrument[types.XMLHttpRequest] = function() {
      natives[types.XMLHttpRequest] = {}
      ;['addEventListener', 'send', 'open'].forEach(function(key) {
        natives[types.XMLHttpRequest][key] = XMLHttpRequest.prototype[key]
      })

      XMLHttpRequest.prototype.open = function() {
        this.__url = arguments[1]
        natives[types.XMLHttpRequest]['open'].apply(this, arguments)
      }

      //TODO 'readystatechange' if (4 === xhr.readyState && 200 === xhr.status) {
      XMLHttpRequest.prototype.addEventListener = function() {
        if (arguments[0] !== 'loadend') {
          natives[types.XMLHttpRequest]['addEventListener'].apply(this, arguments)
          return
        }

        this.loadListeners = this.loadListeners || []
        this.loadListeners.push(arguments[1])
      }

      XMLHttpRequest.prototype.send = function() {
        natives[types.XMLHttpRequest]['addEventListener'].call(this, 'loadend', function() {
          executeCallbacks(this.__callbacks, 'before')
          for (var i = 0; i < (this.loadListeners || []).length; i++) {
            try {
              this.loadListeners[i].apply(this, arguments)
            } catch (e) {
              console.error(e)
            }
          }
          executeCallbacks(this.__callbacks, 'after')
        })

        if (this.onload) {
          var origOnload = this.onload
          this.onload = function() {
            executeCallbacks(this.__callbacks, 'before')
            try {
              origOnload.apply(this, arguments)
            } catch (e) {
              console.error(e)
            }
            executeCallbacks(this.__callbacks, 'after')
          }
        }

        this.__callbacks = register('XMLHttpRequest', this.__url)
        natives[types.XMLHttpRequest]['send'].apply(this, arguments)
      }
    }

    var uninstrument = {}
    uninstrument[types.setTimeout] = function() {
      window.setTimeout = natives[types.setTimeout]
      delete natives[types.setTimeout]
    }
    uninstrument[types.XMLHttpRequest] = function() {
      Object.keys(natives[types.XMLHttpRequest]).forEach(function(nativeKey) {
        XMLHttpRequest.prototype[nativeKey] = natives[types.XMLHttpRequest][nativeKey]
      })
      delete natives[types.XMLHttpRequest]
    }

    function maybeInstrument(type, hook, callback) {
      instrumented[type] = instrumented[type] || {}
      if (Object.keys(instrumented[type]).length === 0) {
        console.info('instrument', type)
        instrument[type] && instrument[type]()
      }
      instrumented[type][ownKey] = true

      watchers[ownKey] = watchers[ownKey] || {}
      watchers[ownKey][type] = watchers[ownKey][type] || {}
      watchers[ownKey][type][hook] = callback
    }

    function register() {
      var args = Array.prototype.slice.call(arguments)
      var type = args.shift()

      var callbacks = {}
      for (var i = watchers.length - 1; i >= 0; i--) {
        var ctx = {}

        var watcher = watchers[i]
        var register = watcher && watcher[type] && watcher[type]['register']
        register && register.apply(undefined, [ctx].concat(args))

        ;['before', 'after'].forEach(function(hook) {
          if (watcher && watcher[type] && watcher[type][hook]) {
            callbacks[hook] = callbacks[hook] || []
            callbacks[hook].push(watcher[type][hook].bind(undefined, ctx))
          }
        })
      }
      return callbacks
    }

    function executeCallbacks(callbacks, hook) {
      (callbacks[hook] || []).forEach((function(callback) {
        callback()
      }))
    }

    function destroy() {
      if (!watchers[ownKey]) {
        return
      }

      Object.keys(watchers[ownKey]).forEach(function(type) {
        if (instrumented[type]) {
          delete instrumented[type][ownKey]
          if (Object.keys(instrumented[type]).length === 0) {
            console.info('uninstrument', type)
            uninstrument[type] && uninstrument[type]()
            delete instrumented[type]
          }
        }
      })
      delete watchers[ownKey]
    }

  }
}())

module.exports = {
  init: init,
  types: types,
}

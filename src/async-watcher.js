var init, types
(function() {
  var key = 0, watchers = {}, natives = {}

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

    function maybeInstrument(type, hook, callback) {
      watchers[type] = watchers[type] || {}
      if (Object.keys(watchers[type]).length === 0) {
        instrument[type] && instrument[type]()
      }
      watchers[type][ownKey] = watchers[type][ownKey] || {}
      watchers[type][ownKey][hook] = callback
    }

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
    this.destroy = function() {
      Object.keys(watchers).forEach(function(type) {
        if (watchers[type][ownKey]) {
          delete watchers[type][ownKey]
          if (Object.keys(watchers[type]).length === 0) {
            console.info('uninstrument', type)
            uninstrument[type] && uninstrument[type]()
            delete watchers[type]
          }
        }
      })
    }

    var instrument = {}
    instrument[types.setTimeout] = function() {
      natives[types.setTimeout] = setTimeout
      window.setTimeout = function(callback, delay) {
        var ctxs = register('setTimeout', delay)
        natives[types.setTimeout].call(this, function() {
          maybeCallbacks('setTimeout', 'before', ctxs)
          callback() // TODO try/catch ?
          maybeCallbacks('setTimeout', 'after', ctxs)
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
          maybeCallbacks('XMLHttpRequest', 'before', this.ctxs)
          for (var i = 0; i < (this.loadListeners || []).length; i++) {
            try {
              this.loadListeners[i].apply(this, arguments)
            } catch (e) {
              console.error(e)
            }
          }
          maybeCallbacks('XMLHttpRequest', 'after', this.ctxs)
        })

        if (this.onload) {
          var origOnload = this.onload
          this.onload = function() {
            before && before(ctx)
            try {
              origOnload.apply(this, arguments)
            } catch (e) {
              console.error(e)
            }
            after && after(ctx)
          }
        }

        this.ctxs = register('XMLHttpRequest', this.__url)
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

    function register() {
      var args = Array.prototype.slice.call(arguments)
      var type = args.shift()
      var ctxs = {}

      Object.keys(watchers[type]).forEach(function(key) {
        ctxs[key] = {}
        const register = watchers[type][key]['register']
        var x = [ctxs[key]].concat(args)
        register && register.apply(undefined, x)
      })
      return ctxs
    }

    function maybeCallbacks(type, hook, ctxs) {
      Object.keys(watchers[type]).forEach(function(key) {
        const callback = watchers[type][key][hook]
        callback && callback(ctxs[key])
      })
    }

  }
}())

module.exports = {
  init: init,
  types: types,
}

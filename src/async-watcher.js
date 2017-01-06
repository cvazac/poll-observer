var init, types
(function() {
  var index = 0, watchers = {}, natives = {}
  init = function() {
    return new AsyncWatcher()
  }
  types = {
    setTimeout: 'setTimeout',
    XMLHttpRequest: 'XMLHttpRequest',
  }
  types.all = Object.keys(types)

  function AsyncWatcher() {
    var register, before, after, ownIndex = index++

    function maybeInstrument(type) {
      watchers[type] = watchers[type] || {}
      if (Object.keys(watchers[type]).length === 0) {
        console.info('instrument', type)
        instrument[type] && instrument[type]()
      }
      watchers[type][ownIndex] = true
    }

    this.register = function(type, callback) {
      if (typeof callback === 'function') {
        maybeInstrument(type)
        register = function() {
          callback.apply(undefined, arguments)
        }
      }
      return this
    }
    this.before = function(type, callback) {
      if (typeof callback === 'function') {
        maybeInstrument(type)
        before = callback
      }
      return this
    }
    this.after = function(type, callback) {
      if (typeof callback === 'function') {
        maybeInstrument(type)
        after = callback
      }
      return this
    }
    this.destroy = function() {
      Object.keys(watchers).forEach(function(type) {
        if (watchers[type][ownIndex]) {
          delete watchers[type][ownIndex]
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
        var ctx = {}
        register && register(ctx, delay)
        natives[types.setTimeout].call(this, function() {
          before && before(ctx)
          callback()
          after && after(ctx)
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
        var ctx = {}
        natives[types.XMLHttpRequest]['addEventListener'].call(this, 'loadend', function() {
          before && before(ctx)
          for (var i = 0; i < (this.loadListeners || []).length; i++) {
            try {
              this.loadListeners[i].apply(this, arguments)
            } catch (e) {
              console.error(e)
            }
          }
          after && after(ctx)
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

        register && register(ctx, this.__url)
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

  }
}())

module.exports = {
  init: init,
}
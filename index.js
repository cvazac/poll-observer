// ==UserScript==
// @name         poll.js
// @version      0.1
// @author       You
// @include http://*
// @include https://*
// @grant        none
// ==/UserScript==

;(function() {

  function PollObserver(originatingXhrFunction, types) {
    types = types || [AsyncWatcher.types.XMLHttpRequest]

    var listener, initiator
    this.schedulerWatch = AsyncWatchers.on(types).register(function(type, arg) {
      console.info('in register')
      function getInitiator() {
        if (arg) console.info(arg)
        var caller = getInitiator, top
        while (caller) {
          //console.info('CALLER *****')
          //console.info('name', caller.name)
          //console.info('arguments', caller.arguments)
          for (var i = 0; i < caller.arguments.length; i++) {
            //console.info('compare', arg.url, caller.arguments[i])
            if (arg.url.indexOf(caller.arguments[i])) {
              top = caller
            }
          }

          caller = caller.caller
        }

        //debugger
        console.info('getInitiator', top)
        //if (top) {
          //debugger
        //}

        return Math.random()
      }

      initiator = originatingXhrFunction || getInitiator()
      if (type === AsyncWatcher.types.XMLHttpRequest && originatingXhrFunction === getInitiator()) {
        return reportLoop()
      }
    }).before(function() {
      listener = new PollObserver(initiator, AsyncWatcher.types.all)
    }).after(function() {
      listener.destroy()
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

    this.register = function(callback) {
      forEach('register', callback)
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

  /* AsyncWatcher */
  AsyncWatcher.on = function(type) {
    return new AsyncWatcher(type)
  }

  AsyncWatcher.types = {
    setTimeout: 'setTimeout',
    XMLHttpRequest: 'XMLHttpRequest',
  }
  AsyncWatcher.types.all = Object.keys(AsyncWatcher.types)

  function AsyncWatcher(type) {
    var register, before, after, destroy

    switch (type) {
      case AsyncWatcher.types.setTimeout:
        var native = setTimeout
        window.setTimeout = function (callback, delay) {
          register && register()
          native.apply(undefined, function () {
            before && before()
            callback()
            after && after()
          }, delay)
        }

        destroy = function () {
          window.setTimeout = native
        }
        break

      case AsyncWatcher.types.XMLHttpRequest:
        var prototypes = {}
        var keys = ['addEventListener', 'send', 'open']
        for (var i = 0; i < keys.length; i++) {
          prototypes[keys[i]] = XMLHttpRequest.prototype[keys[i]]
        }

        XMLHttpRequest.prototype.open = function () {
          this.__url = arguments[1]
          prototypes['open'].apply(this, arguments)
        }

        // TODO treat changes to 'readystatechange' as a loadend, under the correct `readyState` and `status` values
        XMLHttpRequest.prototype.addEventListener = function () {
          if (arguments[0] !== 'loadend') {
            prototypes['addEventListener'].apply(this, arguments)
            return
          }

          this.loadListeners = this.loadListeners || []
          this.loadListeners.push(arguments[1])
        }

        XMLHttpRequest.prototype.send = function () {
          prototypes['addEventListener'].call(this, 'loadend', function () {
            before && before()
            for (var i = 0; i < (this.loadListeners || []).length; i++) {
              try {
                this.loadListeners[i].apply(this, arguments)
              } catch (e) {
              }
            }
            after && after()
          })

          if (this.onload) {
            var origOnload = this.onload
            this.onload = function () {
              before && before()
              try {
                origOnload.apply(this, arguments)
              } catch (e) {
              }
              after && after()
            }
          }

          register && register({
            url: this.__url
          })
          prototypes['send'].apply(this, arguments)
        }

        destroy = function () {
          for (var key in prototypes) {
            if (prototypes.hasOwnProperty(key)) {
              XMLHttpRequest.prototype[key] = prototypes[key]
            }
          }
        }
        break

    }

    this.register = function(callback) {
      register = typeof callback === 'function' && function() {
        var args = Array.prototype.slice.call(arguments)
        args.unshift(type)
        callback.apply(undefined, args)
      }
    }
    this.before = function(callback) {
      before =  typeof callback === 'function' && callback
    }
    this.after = function(callback) {
      after =  typeof callback === 'function' && callback
    }
    this.destroy = function() {
      destroy && destroy()
    }
  }

  var po = new PollObserver()
  false && setTimeout(function() {
    po.destroy()
  })

})()
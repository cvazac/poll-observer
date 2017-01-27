var observe, disconnect
(function() {
  'use strict'

  var natives = {}
  function forEach(array, fn, _this) {
    array = array || []
    for (var i = 0; i < array.length; i++) {
      fn.call(_this, array[i], i)
    }
  }
  function forEachKey(object, fn, _this) {
    var i = 0
    for (var key in object) {
      object.hasOwnProperty(key) && fn.call(_this, key, i++)
    }
  }
  observe = function(listener) {
    var stack = [], pushToStack = function(tick) {
        var __stack = stack.slice(0)
        __stack.push(tick)
        return __stack
      }, addTick = pushToStack

    instrumentAll()

    function instrumentAll() {
      // TODO postMessage / addEventListener('message')

      forEach(['setTimeout', 'setImmediate', 'requestAnimationFrame', 'requestIdleCallback'], function(methodName) {
        if (typeof window[methodName] === 'undefined') {
          return
        }

        natives[methodName] = window[methodName]
        window[methodName] = function() {
          var args = Array.prototype.slice.call(arguments)
          var callback = args[0]
          if (typeof callback !== 'function') {
            return
          }

          var __stack = addTick({
            type: methodName
          })
          args[0] = function() {
            stack = __stack
            callback()
            stack = []
          }
          return natives[methodName].apply(this, args)
        }
      })

      natives['setInterval'] = window.setInterval
      window.setInterval = function() {
        var args = Array.prototype.slice.call(arguments)
        var callback = args[0]
        if (typeof callback !== 'function') {
          return
        }

        var __stack = []
        addTick({
          type: 'setInterval'
        })
        args[0] = function() {
          addTick = function(tick) {
            __stack.push(tick)
            return __stack
          }
          callback()
          addTick = pushToStack
        }
        return natives['setInterval'].apply(this, args)
      }

      natives['XMLHttpRequest'] = {}
      forEach(['addEventListener', 'removeEventListener', 'send', 'open'], function(key) {
        natives['XMLHttpRequest'][key] = XMLHttpRequest.prototype[key]
      })

      XMLHttpRequest.prototype.open = function() {
        this.__url = arguments[1]
        natives['XMLHttpRequest']['open'].apply(this, arguments)
      }

      XMLHttpRequest.prototype.addEventListener = function() {
        var args = Array.prototype.slice.call(arguments)

        var origListener = args[1]
        if (typeof origListener === 'function') {
          origListener.__wrapped = function() {
            beforeXhr(this)
            origListener.apply(this, arguments)
            afterXhr(this)
          }
          args[1] = origListener.__wrapped
        }

        natives['XMLHttpRequest']['addEventListener'].apply(this, args)
      }

      XMLHttpRequest.prototype.removeEventListener = function() {
        var args = Array.prototype.slice.call(arguments)
        args[1] = args[1].__wrapped
        natives['XMLHttpRequest']['removeEventListener'].apply(this, args)
      }

      XMLHttpRequest.prototype.send = function() {
        // investigate if these can be unset _after_ .send()
        var xhr = this
        forEach(['loadstart', 'progress', 'load', 'loadend', 'readystatechange', 'abort', 'error', 'timeout'], function(event) {
          var propName = 'on' + event
          if (!xhr[propName]) {
            return
          }

          var origListener = xhr[propName]
          xhr[propName] = function() {
            beforeXhr(this)
            try {
              origListener.apply(this, arguments)
            } catch (e) {
              console.error(e)
            }
            afterXhr(this)
          }
        })

        natives['XMLHttpRequest']['send'].apply(this, arguments)
        this.__stack = addTick({
          type: 'XMLHttpRequest',
          url: typeof this.__url.toString === 'function' ? this.__url.toString() : this.__url // __url could be and object
        })
        checkLoop(this)
      }

      function beforeXhr(xhr) {
        stack = xhr.__stack
      }
      function afterXhr(xhr) {
        stack = []
      }
      function checkLoop(xhr) {
        var entries = []
        forEach(xhr.__stack, function(tick) {
          if (tick.type === 'XMLHttpRequest') {
            entries.push({
              type: 'poll',
              url: tick.url
            })
          }
        })
        entries.length > 1 && listener({
          getEntries: function() {
            return entries
          }
        })
      }
    }
  }
  disconnect = function() {
    forEachKey(natives, function(objectKey) {
      if (typeof natives[objectKey] === 'function') {
        window[objectKey] = natives[objectKey]
        return
      }
      forEachKey(natives[objectKey], function(methodKey) {
        window[objectKey].prototype[methodKey] = natives[objectKey][methodKey]
      })
    })

    natives = {}
  }
})()

module.exports = {
  observe: observe,
  disconnect: disconnect
}

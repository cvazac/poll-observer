var start, stop
(function() {
  'use strict';

  var natives = {}
  start = function(listener) {
    var stack = [], pushToStack = function(tick) {
      const __stack = stack.slice(0)
      __stack.push(tick)
      return __stack
    }, addTick = pushToStack

    instrumentAll()

    function instrumentAll() {
      natives['setTimeout'] = window.setTimeout
      window.setTimeout = function (callback, delay) {
        if (typeof callback !== 'function') {
          return
        }

        const __stack = addTick({
          type: 'setTimeout',
          delay: delay,
        })
        return natives['setTimeout'].call(this, function () {
          stack = __stack
          callback()
          stack = []
        }, delay)
      }

      natives['setInterval'] = window.setInterval
      window.setInterval = function (callback, delay) {
        if (typeof callback !== 'function') {
          return
        }

        const __stack = []
        addTick({
          type: 'setInterval',
          delay: delay,
          stack: __stack,
        })
        return natives['setInterval'].call(this, function () {
          addTick = function(tick) {
            __stack.push(tick)
            return __stack
          }
          callback()
          addTick = pushToStack
        }, delay)
      }

      natives['XMLHttpRequest'] = {}
      ;['addEventListener', 'removeEventListener', 'send', 'open'].forEach(function (key) {
        natives['XMLHttpRequest'][key] = XMLHttpRequest.prototype[key]
      })

      XMLHttpRequest.prototype.open = function () {
        this.__url = arguments[1]
        natives['XMLHttpRequest']['open'].apply(this, arguments)
      }

      XMLHttpRequest.prototype.addEventListener = function () {
        var args = Array.prototype.slice.call(arguments)

        var origListener = args[1]
        if (typeof origListener === 'function') {
          origListener.__wrapped = function () {
            beforeXhr(this)
            origListener.apply(this, arguments)
            afterXhr(this)
          }
          args[1] = origListener.__wrapped
        }

        natives['XMLHttpRequest']['addEventListener'].apply(this, args)
      }

      XMLHttpRequest.prototype.removeEventListener = function () {
        var args = Array.prototype.slice.call(arguments)
        args[1] = args[1].__wrapped
        natives['XMLHttpRequest']['removeEventListener'].apply(this, args)
      }

      XMLHttpRequest.prototype.send = function () {
        //investigate if these can be unset _after_ .send()
        var xhr = this
        ;['loadstart', 'progress', 'load', 'loadend', 'readystatechange', 'abort', 'error', 'timeout'].forEach(function (event) {
          const propName = 'on' + event
          if (!xhr[propName]) {
            return
          }

          var origListener = xhr[propName]
          xhr[propName] = function () {
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
          url: typeof this.__url.toString === 'function' ? this.__url.toString() : this.__url, //__url could be and object
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
        const xhrs = []
        xhr.__stack.forEach(function (tick) {
          if (tick.type === 'XMLHttpRequest') {
            xhrs.push(tick.url)
          }
        })
        xhrs.length > 1 && listener(xhrs)
      }
    }
  }
  stop = function() {
    Object.keys(natives).forEach(function(objectKey) {
      if (typeof natives[objectKey] === 'function') {
        return window[objectKey] = natives[objectKey]
      }
      Object.keys(natives[objectKey]).forEach(function(methodKey) {
        window[objectKey].prototype[methodKey] = natives[objectKey][methodKey]
      })
    })

    natives = {}
  }
})()

module.exports = {
  start: start,
  stop: stop,
}

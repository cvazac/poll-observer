module.exports = {
  xhr: function(url, callback) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.addEventListener('loadend', callback)
    xhr.send()
  },
  stamp: (function() {
    try {
      var p = window.performance
      if (p && typeof p.now === 'function') {
        return function() {
          return p.now()
        }
      }
    } catch (ignore) {}

    return Date.now || function() {
      return new Date().getTime()
    }
  }())
}

module.exports = function(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.addEventListener('loadend', function() {
    callback(JSON.parse(xhr.responseText))
  })
  xhr.send()
}

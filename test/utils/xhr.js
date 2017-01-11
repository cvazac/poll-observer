function loadend(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.addEventListener('loadend', function() {
    callback(JSON.parse(xhr.responseText))
  })
  xhr.send()
}

function onload(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.setRequestHeader('Content-Type', 'application/json')
  xhr.onload = function() {
    callback(JSON.parse(xhr.responseText))
  }
  xhr.send()
}

module.exports = {
  loadend: loadend,
  onload: onload,
}

module.exports = function(url, callback) {
  var xhr = new XMLHttpRequest()
  xhr.open('GET', url)
  xhr.setRequestHeader('Content-Type', 'application/json')

  function onload () {
    callback(JSON.parse(xhr.responseText))
  }

  if (1) {
    xhr.addEventListener('loadend', onload)
  } else {
    xhr.onload = onload
  }
  xhr.send()
}

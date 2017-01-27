# poll-observer

## Intro
`poll-observer` instruments `XMLHttpRequest`, `setTimeout`, `setImmediate`, etc. to identify and report common poll loop patterns from the browser. 

## Usage
```
var pollObserver = require('poll-observer')
var shouldDisconnect = false
pollObserver.observe(function(data) {
  var entries = data.getEntries()
  entries.forEach(function(entry) {
    console.info('Poll Entry', entry.type, entry.url)
  })

  if (shouldDisconnect) {
    pollObserver.disconnect()
  }
})
```

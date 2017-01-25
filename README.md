# poll-observer

## Intro
`poll-observer` instruments `XMLHttpRequest`, `setTimeout`, `setImmediate`, etc. to identify and report common poll loop patterns from the browser. 

## Usage
```
var pollObserver = require('poll-observer')
pollObserver.start(function(xhrs) {
  xhrs.forEach(function(xhr) {
    console.info(xhr)
  })
})

// some time later, maybe
pollObserver.stop()
```

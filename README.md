# poll-observer

## Intro
`poll-observer` instruments `XMLHttpRequest`, `setTimeout`, `setInterval`, etc. to identify and report common poll loop patterns from the browser.

## Usage
```
var pollObserver = require('poll-observer')
var shouldDisconnect = false
pollObserver.observe(function(data) {
  var entries = data.getEntries()
  entries.forEach(function(entry) {
    console.info('poll entry:', data.pollId, entry.type, entry.url)
  })

  if (shouldDisconnect) {
    pollObserver.disconnect()
  }
})
```

## Example output
```
poll entry: 0 poll http://mysite.com/data.json?reqIndex=0
poll entry: 0 poll http://mysite.com/data.json?reqIndex=1

.... sometime later, maybe ...
poll entry: 0 poll http://mysite.com/data.json?reqIndex=2

.... and even later, maybe ...
poll entry: 0 poll http://mysite.com/data.json?reqIndex=3
```

## License
This work is licensed under the [MIT license](http://en.wikipedia.org/wiki/MIT_License).

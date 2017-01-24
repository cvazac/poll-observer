var express = require('express')
var app = express()

app.get('*', function(req, res, next) {
  if (typeof req.query.delay === 'undefined') {
    return next()
  }

  setTimeout(next, Number(req.query.delay))
})
app.use(express.static('public'))

app.listen(3000, function() {
  console.log('Example app listening on port 3000!')
})

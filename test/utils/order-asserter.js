var init
(function() {
  init = function(t) {
    return new OrderAssert(t)
  }

  function OrderAssert(t) {
    var currentStep = -1
    this.assert = function() {
      currentStep++

      if (Array.isArray(arguments[0])) {
        var foundStep = arguments[0].find(function (step) {
          return step[0] == currentStep
        })
        t.ok(typeof foundStep !== undefined)
        foundStep && foundStep.slice(1).forEach(t.ok)
        return
      }

      var args = Array.prototype.slice.call(arguments)
      t.equal(currentStep, args.shift())
      args.forEach(t.ok)
    }
  }
})()

module.exports = {
  init: init
}
module.exports = function(fn) {
  return (/\{\s*\[native code\]\s*\}/).test('' + fn)
}

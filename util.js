const util = require('util')
function foo() {
  return 'foo'
}
async function bar() {
  return 'bar'
}
foo[util.promisify.custom] = bar
console.log(util.promisify(foo) === bar) // true
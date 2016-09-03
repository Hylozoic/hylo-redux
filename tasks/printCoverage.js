const cheerio = require('cheerio')
const fs = require('fs')

function run () {
  const html = fs.readFileSync('./coverage/lcov-report/index.html')
  const $ = cheerio.load(html)
  const text = $('.strong, .quiet').map((_, x) => $(x).text()).toArray()
  const print = i => console.log(text.slice(i, i + 2).join(''))
  print(0)
  print(2)
  print(4)
  print(6)
}

module.exports = run

if (require.main === module) {
  run()
}

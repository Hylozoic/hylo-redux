import { createWriteStream, writeFileSync, unlinkSync } from 'fs'
import nightmare from 'nightmare'
import browserify from 'browserify'
import { omit } from 'lodash'

const testFilePath = '/tmp/hylo-redux-test.html'
const testBundlePath = '/tmp/hylo-redux-test.js'

export const writeTestFile = contents =>
  writeFileSync(testFilePath, contents)

// this creates a test file with a bundle based on support/scaffolds/${name}.js.
// set up your test conditions and then render your component(s) in that file;
// it will be used as an entry point for a Browserify bundle and then run in the
// Nightmare browser environment.
export const useTestFileScaffold = name =>
  createBundle(`test/browser/support/scaffolds/${name}.js`)
  .then(() => {
    writeTestFile(`<html>
    <body><div id="root"></div></body>
    <script type='text/javascript' src='file://${testBundlePath}'></script>
    </html>`)
  })

export const createBundle = filename =>
  new Promise((resolve, reject) => {
    const startTime = new Date() // eslint-disable-line no-unused-vars
    browserify({entries: [filename]})
    .transform('babelify')
    .transform('envify')
    .on('error', reject)
    .bundle()
    .pipe(createWriteStream(testBundlePath))
    .on('finish', () => {
      // console.log(`bundled ${filename} in ${new Date() - startTime}ms`)
      resolve()
    })
  })

export const removeTestFile = () => {
  try {
    unlinkSync(testFilePath)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

export const loadTestFile = (options = {}) => {
  const n = nightmare(omit(options, 'before'))
  if (typeof options.before === 'function') options.before(n)
  return n.goto('file://' + testFilePath)
}

export class TestRunner {
  constructor (options = {}) {
    this.options = options
    this.mare = nightmare(omit(options, 'before'))

    this.log = []
    this.mare.on('console', (type, message) => {
      if (type === 'log') return this.log.push(message)
      console.log(`${type}: ${message}`)
    })
  }

  start () {
    const { scaffold } = this.options
    return Promise.resolve(scaffold && useTestFileScaffold(scaffold))
    .then(() => this.mare.goto('file://' + testFilePath))
  }

  stop () {
    return this.mare.evaluate(() => window.__coverage__)
    .end()
    .then(coverage => {
      if (!coverage) return
      const filename = `./.nyc_output/${this.options.scaffold}.json`
      writeFileSync(filename, JSON.stringify(coverage))
    })
    .then(() => removeTestFile())
  }

  wait (...args) {
    return this.mare.wait(...args)
  }

  evaluate (...args) {
    return this.mare.wait(...args)
  }
}

require('../support')

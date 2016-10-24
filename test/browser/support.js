import { createWriteStream, writeFileSync, unlinkSync } from 'fs'
import nightmare from 'nightmare'
import browserify from 'browserify'

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
    <body></body>
    <script type='text/javascript' src='file://${testBundlePath}'></script>
    </html>`)
  })

export const createBundle = filename => {
  return new Promise((resolve, reject) =>
    browserify({entries: [filename]})
    .transform('babelify')
    .transform('envify')
    .on('error', reject)
    .bundle()
    .pipe(createWriteStream(testBundlePath))
    .on('finish', () => resolve()))
}

export const removeTestFile = () => {
  try {
    unlinkSync(testFilePath)
  } catch (err) {
    if (err.code !== 'ENOENT') throw err
  }
}

export const loadTestFile = (beforeGoto) => {
  const n = nightmare()
  if (typeof beforeGoto === 'function') beforeGoto(n)
  return n.goto('file://' + testFilePath)
}

require('../support')

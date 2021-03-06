import gulp from 'gulp'
import livereload from 'gulp-livereload'
import { watch, bundle } from './tasks/browserify'
import { lessDev, lessDist } from './tasks/less'
import { spawn } from 'child_process'
import { debounce } from 'lodash'
import upload from './tasks/upload'
import updateHeroku from './tasks/updateHeroku'
import loadHerokuEnv from './tasks/loadHerokuEnv'
import { writeToManifest } from './tasks/util'
import { exec } from 'shelljs'
import runSequence from 'run-sequence'
const seq = (...args) => done => runSequence(...args, done)

// make gulp respond to Ctrl-C
process.once('SIGINT', () => process.exit(0))

gulp.task('watch-js', watch)
gulp.task('build-dev-css', lessDev)

gulp.task('serve', function () {
  require('nodemon')({
    verbose: true,
    script: './src/server',
    exec: './node_modules/.bin/babel-node',
    ignore: ['public/**/*', 'dist/**/*']
  })
})

function clearScreen () {
  process.stdout.write('\u001b[2J')
  process.stdout.write('\u001b[1;3H')
  process.stdout.write(new Date().toString() + '\n')
}

gulp.task('autotest', function () {
  const argv = require('minimist')(process.argv)
  const file = argv.file || argv.f
  const run = './node_modules/.bin/mocha --compilers js:babel-register -R progress'
  const cmd = file
    ? `${run} ${file}`
    : `${run} && ${run} test/client/index.js`
  gulp.watch(['src/**/*', 'test/**/*'], debounce(function () {
    clearScreen()
    spawn('bash', ['-c', cmd], {stdio: 'inherit'})
  }, 5000, true))
})

gulp.task('watch', function () {
  require('dotenv').load({silent: true})
  if (process.env.LIVERELOAD) livereload.listen()
  gulp.watch('css/**/*.less', ['build-dev-css'])
})

gulp.task('default', ['watch-js', 'serve', 'watch'])

// ---------------------------------------------------------------------
// deployment tasks
// ---------------------------------------------------------------------

gulp.task('clean-dist', function () {
  return exec('rm -r dist', {silent: true})
})

gulp.task('copy-dist-images', function () {
  const task = gulp.src('public/img/**/*', {base: 'public'})
  return writeToManifest(task)
})

gulp.task('dotenv', () => require('dotenv').load())
gulp.task('load-heroku-env', loadHerokuEnv)

// build-dist-css depends upon copy-dist-images because it needs to read
// the manifest to rewrite image urls in CSS
gulp.task('build-dist-css', ['copy-dist-images'], lessDist)
gulp.task('build-dist-js', bundle)
gulp.task('upload', upload)
gulp.task('update-heroku', updateHeroku)

gulp.task('build', seq('clean-dist', 'build-dist-css', 'build-dist-js'))
gulp.task('build-prod', seq('load-heroku-env', 'build'))
gulp.task('build-dev', seq('dotenv', 'build'))
gulp.task('deploy', seq('build-prod', 'upload', 'update-heroku'))

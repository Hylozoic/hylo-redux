import gulp from 'gulp'
import nodemon from 'gulp-nodemon'
import livereload from 'gulp-livereload'
import { watch, bundle } from './tasks/browserify'
import { lessDev, lessDist } from './tasks/less'
import { spawn } from 'child_process'
import { debounce } from 'lodash'
import upload from './tasks/upload'
import updateHeroku from './tasks/updateHeroku'
import loadHerokuEnv from './tasks/loadHerokuEnv'
import rev from 'gulp-rev'
import { exec } from 'shelljs'
import runSequence from 'run-sequence'

// make gulp respond to Ctrl-C
process.once('SIGINT', () => process.exit(0))

gulp.task('watch-js', watch)
gulp.task('build-dev-css', lessDev)

gulp.task('serve', function () {
  nodemon({
    script: './src/server',
    exec: './node_modules/.bin/babel-node',
    ignore: ['public/**/*', 'dist/**/*']
  })
})

gulp.task('autotest', function () {
  const argv = require('minimist')(process.argv)
  const file = argv.file || argv.f
  const run = './node_modules/.bin/babel-node ./node_modules/.bin/_mocha -R progress'
  const cmd = file
    ? `${run} -- ${file}`
    : `${run} && ${run} -- test/client/index.js`
  gulp.watch(['src/**/*', 'test/**/*'], debounce(function () {
    spawn('bash', ['-c', cmd], {stdio: 'inherit'})
  }, 500, true))
})

gulp.task('watch', function () {
  require('dotenv').load({silent: true})
  if (process.env.LIVERELOAD) livereload.listen()
  gulp.watch('css/**/*.less', ['build-dev-css'])
})

gulp.task('default', ['build-dev-css', 'watch-js', 'serve', 'watch'])

// ---------------------------------------------------------------------
// deployment tasks
// ---------------------------------------------------------------------

gulp.task('clean-dist', function () {
  return exec('rm -r dist', {silent: true})
})

gulp.task('copy-dist-images', function () {
  return gulp.src('public/img/**/*', {base: 'public'})
  .pipe(rev())
  .pipe(gulp.dest('dist'))
  .pipe(rev.manifest({base: 'dist', path: 'dist/manifest.json', merge: true}))
  .pipe(gulp.dest('dist'))
})

gulp.task('load-heroku-env', loadHerokuEnv)

// build-dist-css depends upon copy-dist-images because it needs to read
// the manifest to rewrite image urls in CSS
gulp.task('build-dist-css', ['copy-dist-images'], lessDist)
gulp.task('build-dist-js', bundle)
gulp.task('upload', upload)
gulp.task('update-heroku', updateHeroku)

gulp.task('build', function (done) {
  runSequence(
    'clean-dist',
    'load-heroku-env',
    ['build-dist-css', 'build-dist-js'],
    done
  )
})

gulp.task('deploy', function (done) {
  runSequence(
    'clean-dist',
    'load-heroku-env',
    ['build-dist-css', 'build-dist-js'],
    'upload',
    'update-heroku',
    done
  )
})

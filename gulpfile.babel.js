import gulp from 'gulp'
import nodemon from 'gulp-nodemon'
import livereload from 'gulp-livereload'
import config from './config'
import { watch, bundle } from './tasks/browserify'
import { lessDev, lessDist } from './tasks/less'
import { spawn } from 'child_process'
import { debounce } from 'lodash'
import upload from './tasks/upload'
import rev from 'gulp-rev'

gulp.task('watch-js', watch)
gulp.task('bundle-dist-js', bundle)
gulp.task('bundle-dev-css', lessDev)
gulp.task('bundle-dist-css', lessDist)

gulp.task('serve', function () {
  nodemon({
    script: './src/server',
    exec: './node_modules/.bin/babel-node',
    ignore: ['public/**/*']
  })
})

gulp.task('autotest', function () {
  gulp.watch(['src/**/*', 'test/**/*'], debounce(function () {
    let cmd = 'env LOG_LEVEL=warn npm test -- -R progress'.split(' ')
    spawn(cmd[0], cmd.slice(1, cmd.length), {stdio: 'inherit'})
  }, 500, true))
})

gulp.task('watch', function () {
  if (config.livereload) livereload.listen()
  gulp.watch('css/**/*.less', ['bundle-dev-css'])
})

gulp.task('dist-images', function () {
  gulp.src('public/img/**/*', {base: 'public'})
  .pipe(rev())
  .pipe(gulp.dest('dist'))
  .pipe(rev.manifest({base: 'dist', path: 'dist/manifest.json', merge: true}))
  .pipe(gulp.dest('dist'))
})

gulp.task('default', ['watch-js', 'serve', 'watch'])
gulp.task('upload', ['bundle-dist-js', 'bundle-dist-css'], upload)

process.once('SIGINT', () => process.exit(0))

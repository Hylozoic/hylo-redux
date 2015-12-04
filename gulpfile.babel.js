import gulp from 'gulp'
import nodemon from 'gulp-nodemon'
import livereload from 'gulp-livereload'
import config from './config'
import browserify from './tasks/browserify'
import less from './tasks/less'
import { spawn } from 'child_process'

gulp.task('watch-js', () => browserify.watch())
gulp.task('bundle-dist-js', browserify.bundle)
gulp.task('bundle-dev-css', less.dev)
gulp.task('bundle-dist-css', less.dist)

gulp.task('serve', function () {
  nodemon({
    script: './src/server',
    exec: './node_modules/.bin/babel-node',
    ignore: ['public/**/*']
  })
})

gulp.task('test', function () {
  let cmd = 'env LOG_LEVEL=warn npm test -- -R progress'.split(' ')
  spawn(cmd[0], cmd.slice(1, cmd.length), {stdio: 'inherit'})
})

gulp.task('autotest', function () {
  gulp.watch(['src/**/*', 'test/**/*'], ['test'])
})

gulp.task('watch', function () {
  if (config.livereload) livereload.listen()
  gulp.watch('css/**/*.less', ['bundle-dev-css'])
})

gulp.task('default', ['watch-js', 'serve', 'watch'])
gulp.task('upload', ['bundle-dist-js', 'bundle-dist-css'], require('./tasks/upload'))

process.once('SIGINT', () => process.exit(0))

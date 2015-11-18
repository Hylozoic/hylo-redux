import gulp from 'gulp'
import nodemon from 'gulp-nodemon'
import livereload from 'gulp-livereload'
import config from './config'
import browserify from './tasks/browserify'
import less from './tasks/less'

gulp.task('watch-js', browserify.watch())
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

gulp.task('watch', function () {
  if (config.livereload) livereload.listen()
  gulp.watch('src/**/*.less', ['bundle-dev-css'])
})

gulp.task('default', ['watch-js', 'serve', 'watch'])
gulp.task('upload', ['bundle-dist-js', 'bundle-dist-css'], require('./tasks/upload'))

import gulp from 'gulp'
import gutil from 'gulp-util'
import less from 'gulp-less'
import livereload from 'gulp-livereload'
import minify from 'gulp-minify-css'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'
import notifier from 'node-notifier'
import rev from 'gulp-rev'

export function lessDev () {
  var task = gulp.src('css/index.less')
  .pipe(sourcemaps.init())
  .pipe(less())
  .on('error', function (err) {
    gutil.log(gutil.colors.red('CSS error: ' + err.message))
    notifier.notify({
      title: 'CSS error',
      message: err.message,
      wait: true
    })
    this.emit('end')
  })
  .pipe(sourcemaps.write())
  .pipe(gulp.dest('public'))

  return process.env.DISABLE_LIVERELOAD
    ? task
    : task.pipe(livereload())
}

export function lessDist () {
  return gulp.src('css/index.less')
  .pipe(sourcemaps.init())
  .pipe(less())
  .pipe(minify())
  .pipe(rename('index.css'))
  .pipe(rev())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist'))
  .pipe(rev.manifest({base: 'dist', path: 'dist/manifest.json', merge: true}))
  .pipe(gulp.dest('dist'))
}

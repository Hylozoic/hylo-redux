import gulp from 'gulp'
import gutil from 'gulp-util'
import less from 'gulp-less'
import livereload from 'gulp-livereload'
import minify from 'gulp-minify-css'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'
import notifier from 'node-notifier'
import rev from 'gulp-rev'
import rework from 'gulp-rework'
import reworkUrl from 'rework-plugin-url'
import { readFileSync } from 'fs'

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
  let manifest = JSON.parse(readFileSync('./dist/manifest.json').toString())

  return gulp.src('css/index.less')
  .pipe(sourcemaps.init())
  .pipe(less())
  .pipe(rework(reworkUrl(path => {
    let newPath = manifest[path.replace(/^\//, '')]
    if (newPath) {
      let url = `${process.env.ASSET_HOST}/${process.env.ASSET_PATH}/${newPath}`
      console.log(`${path} => ${url}`)
      return url
    }
    return path
  })))
  .pipe(minify())
  .pipe(rename('index.css'))
  .pipe(rev())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist'))
  .pipe(rev.manifest({base: 'dist', path: 'dist/manifest.json', merge: true}))
  .pipe(gulp.dest('dist'))
}

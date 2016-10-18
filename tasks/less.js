import gulp from 'gulp'
import gutil from 'gulp-util'
import less from 'gulp-less'
import livereload from 'gulp-livereload'
import minify from 'gulp-minify-css'
import rename from 'gulp-rename'
import sourcemaps from 'gulp-sourcemaps'
import notifier from 'node-notifier'
import rework from 'gulp-rework'
import reworkUrl from 'rework-plugin-url'
import { readFileSync } from 'fs'
import { assetUrl, setManifest } from '../src/util/assets'
import { writeToManifest } from './util'

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
  const manifestPath = process.env.DIST_PATH + '/manifest.json'
  const manifest = JSON.parse(readFileSync(manifestPath).toString())
  setManifest(manifest)

  const task = gulp.src('css/index.less')
  .pipe(sourcemaps.init())
  .pipe(less())
  .pipe(rework(reworkUrl(path => assetUrl(path))))
  .pipe(minify())
  .pipe(rename('index.css'))

  return writeToManifest(task, true)
}

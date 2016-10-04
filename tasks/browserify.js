// https://github.com/gulpjs/gulp/blob/master/docs/recipes/fast-browserify-builds-with-watchify.md
//
// we don't trigger livereload after JS changes, because JS changes also
// make nodemon restart the dev server, and if livereload takes place while
// the dev server is still restarting, we get an error page in the browser
// and a five-second delay.
//
// instead we notify livereload after the dev server starts up. this takes
// place inside the server code, not in gulp task code, because it has to
// happen in the callback to server.start, and we can't hook into that
// from gulp because of the "process gap" created by nodemon.

import watchify from 'watchify'
import browserify from 'browserify'
import gulp from 'gulp'
import source from 'vinyl-source-stream'
import buffer from 'vinyl-buffer'
import gutil from 'gulp-util'
import sourcemaps from 'gulp-sourcemaps'
import streamify from 'gulp-streamify'
import uglify from 'gulp-uglify'
import rev from 'gulp-rev'

const opts = {
  entries: ['./src/client']
}

const setup = b => {
  b.transform('babelify')
  b.transform('envify')
  return b
}

export function watch () {
  var b = watchify(browserify(Object.assign({}, opts, watchify.args)))
  b.plugin('livereactload')
  b.on('log', gutil.log)
  setup(b)

  var update = function () {
    return b.bundle()
    .on('error', gutil.log.bind(gutil, 'Browserify error'))
    .pipe(source('index.js'))
    .pipe(buffer())
    .pipe(sourcemaps.init({loadMaps: true}))
    .pipe(sourcemaps.write('./'))
    .pipe(gulp.dest('public'))
  }

  b.on('update', update)

  return update()
}

export function bundle () {
  return setup(browserify(opts))
  .transform('uglifyify')
  .bundle()
  .on('error', gutil.log.bind(gutil, 'Browserify error'))
  .pipe(source('index.js'))
  .pipe(buffer())
  .pipe(sourcemaps.init({loadMaps: true}))
  .pipe(streamify(uglify()))
  .pipe(rev())
  .pipe(sourcemaps.write('./'))
  .pipe(gulp.dest('dist'))
  .pipe(rev.manifest({base: 'dist', path: 'dist/manifest.json', merge: true}))
  .pipe(gulp.dest('dist'))
}

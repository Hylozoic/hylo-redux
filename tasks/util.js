import { exec } from 'shelljs'
import Heroku from 'heroku-client'
import rev from 'gulp-rev'
import sourcemaps from 'gulp-sourcemaps'
import gulp from 'gulp'

export const commitTag = () => {
  let cmd = "git show|head -n1|awk '{print $2}'|cut -c -8"
  return exec(cmd, {silent: true}).stdout.replace(/\n/, '')
}

export const herokuConfig = () => {
  require('dotenv').load({path: './.env.deploy', silent: true})

  const token = process.env.HEROKU_API_TOKEN
  if (!token) throw new Error('HEROKU_API_TOKEN is not set')

  const appName = process.env.HEROKU_APP_NAME
  if (!appName) throw new Error('HEROKU_APP_NAME is not set')

  let client = new Heroku({token})
  return client.apps(appName).configVars()
}

export const writeToManifest = (task, withSourcemaps) => {
  const base = process.env.DIST_PATH
  const path = base + '/manifest.json'

  task = task.pipe(rev())
  if (withSourcemaps) task = task.pipe(sourcemaps.write('./'))
  return task
  .pipe(gulp.dest(base))
  .pipe(rev.manifest({base, path, merge: true}))
  .pipe(gulp.dest(base))
}

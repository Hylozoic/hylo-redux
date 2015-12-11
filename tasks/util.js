import { exec } from 'shelljs'
import Heroku from 'heroku-client'

export const commitTag = () => {
  let cmd = "git show|head -n1|awk '{print $2}'|cut -c -8"
  return exec(cmd, {silent: true}).output.replace(/\n/, '')
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

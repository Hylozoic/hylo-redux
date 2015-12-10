import { commitTag } from './util'
import Heroku from 'heroku-client'

const token = process.env.HEROKU_API_TOKEN
if (!token) throw new Error('HEROKU_API_TOKEN is not set')

const appName = process.env.HEROKU_APP_NAME
if (!appName) throw new Error('HEROKU_APP_NAME is not set')

export default function (done) {
  let client = new Heroku({token})
  let tag = commitTag()
  console.log('setting SOURCE_VERSION to', tag)
  client.apps(appName).configVars().update({
    SOURCE_VERSION: tag
  }, () => done())
}

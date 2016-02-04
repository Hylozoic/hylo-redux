import { herokuConfig } from './util'
import { extend, pick } from 'lodash'

const keys = [
  'NODE_ENV',
  'ASSET_HOST',
  'ASSET_PATH',
  'AWS_ACCESS_KEY_ID',
  'AWS_SECRET_ACCESS_KEY',
  'AWS_S3_BUCKET',
  'AWS_S3_HOST',
  'FACEBOOK_APP_ID',
  'FILEPICKER_API_KEY',
  'GOOGLE_BROWSER_KEY',
  'GOOGLE_CLIENT_ID',
  'LOG_LEVEL',
  'UPSTREAM_HOST'
]

export default function (done) {
  herokuConfig().info((err, vars) => {
    if (err) done(err)

    extend(process.env, pick(vars, keys))
    done()
  })
}

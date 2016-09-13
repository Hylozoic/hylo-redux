import { herokuConfig } from './util'
import { extend, pick } from 'lodash'

const keys = [
  'ASSET_HOST',
  'ASSET_PATH',
  'AWS_ACCESS_KEY_ID',
  'AWS_S3_BUCKET',
  'AWS_S3_HOST',
  'AWS_SECRET_ACCESS_KEY',
  'FACEBOOK_APP_ID',
  'FILEPICKER_API_KEY',
  'GOOGLE_BROWSER_KEY',
  'GOOGLE_CLIENT_ID',
  'HOST',
  'LOG_LEVEL',
  'NODE_ENV',
  'SEGMENT_KEY',
  'SLACK_APP_CLIENT_ID',
  'SOCKET_HOST',
  'UPSTREAM_HOST'
]

export default function (done) {
  herokuConfig().info((err, vars) => {
    if (err) done(err)

    extend(process.env, pick(vars, keys))
    done()
  })
}

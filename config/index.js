import dotenv from 'dotenv'
if (typeof window === 'undefined') dotenv.load()
import { merge } from 'lodash'

var environment = process.env.NODE_ENV || 'development'

const config = {
  environment,
  useAssetManifest: true,
  assetHost: process.env.ASSET_HOST || '',
  logLevel: process.env.LOG_LEVEL,
  sourceVersion: process.env.SOURCE_VERSION,
  filepickerKey: process.env.FILEPICKER_API_KEY,
  s3: {
    bucket: process.env.AWS_S3_BUCKET,
    host: process.env.AWS_S3_HOST
  },
  google: {
    key: process.env.GOOGLE_BROWSER_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID
  }
}

// server-side only values go here
if (typeof window === 'undefined') {
  merge(config, {
    s3: {
      accessKey: process.env.AWS_ACCESS_KEY_ID,
      secret: process.env.AWS_SECRET_ACCESS_KEY
    },
    port: process.env.PORT || 9000,
    upstreamHost: process.env.UPSTREAM_HOST || 'http://localhost:3001',
    livereload: !!process.env.LIVERELOAD
  })
}

if (typeof window !== 'undefined') {
  window.__appConfig = config
}

export default config

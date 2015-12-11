import dotenv from 'dotenv'
if (typeof window === 'undefined') dotenv.load()

var environment = process.env.NODE_ENV || 'development'

const config = {
  environment,
  useAssetManifest: environment === 'production',
  assetHost: process.env.ASSET_HOST || '',
  logLevel: process.env.LOG_LEVEL,
  sourceVersion: process.env.SOURCE_VERSION,
  filepickerKey: process.env.FILEPICKER_API_KEY,
  upstreamHost: process.env.UPSTREAM_HOST,
  s3: {
    bucket: process.env.AWS_S3_BUCKET,
    host: process.env.AWS_S3_HOST
  },
  google: {
    key: process.env.GOOGLE_BROWSER_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID
  }
}

export default config

if (typeof window !== 'undefined') {
  window.__appConfig = config
}

if (typeof window === 'undefined') require('dotenv').load()

const environment = process.env.NODE_ENV || 'development'

const config = {
  environment,
  useAssetManifest: environment === 'production',
  assetHost: process.env.ASSET_HOST || '',
  assetPath: process.env.ASSET_PATH || '',
  filepickerKey: process.env.FILEPICKER_API_KEY,
  logLevel: process.env.LOG_LEVEL,
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

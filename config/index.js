import dotenv from 'dotenv'
if (typeof window === 'undefined') dotenv.load()

var environment = process.env.NODE_ENV || 'development'

var minIfProduction = function (filename) {
  if (environment === 'development') return `/${filename}`

  var x = filename.split('.')
  var i = x.length - 1
  return `${process.env.ASSET_HOST}/${x.slice(0, i).join('.')}.min.${x[i]}`
}

const config = {
  environment: environment,
  port: process.env.PORT || 9000,
  upstreamHost: process.env.UPSTREAM_HOST || 'http://localhost:3001',
  livereload: !!process.env.LIVERELOAD,
  assetHost: process.env.ASSET_HOST || '',
  cssBundle: minIfProduction('index.css'),
  jsBundle: minIfProduction('index.js'),
  logLevel: process.env.LOG_LEVEL,
  filepickerKey: process.env.FILEPICKER_API_KEY,
  s3: {
    accessKey: process.env.AWS_ACCESS_KEY_ID,
    secret: process.env.AWS_SECRET_ACCESS_KEY,
    bucket: process.env.AWS_S3_BUCKET,
    host: process.env.AWS_S3_HOST
  },
  google: {
    key: process.env.GOOGLE_BROWSER_KEY,
    clientId: process.env.GOOGLE_CLIENT_ID
  }
}

// don't expose secret info to client
if (typeof window !== 'undefined') {
  delete config.s3.accessKey
  delete config.s3.secret
}

export default config

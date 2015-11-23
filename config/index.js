import dotenv from 'dotenv'
if (typeof window === 'undefined') dotenv.load()

var environment = process.env.NODE_ENV || 'development'

var minIfProduction = function (filename) {
  if (environment === 'development') return `/${filename}`

  var x = filename.split('.')
  var i = x.length - 1
  return `${process.env.ASSET_HOST}/${x.slice(0, i).join('.')}.min.${x[i]}`
}

var conf = {
  environment: environment,
  port: process.env.PORT || 9000,
  upstreamHost: process.env.UPSTREAM_HOST || 'http://localhost:3001',
  livereload: !!process.env.LIVERELOAD,
  assetHost: process.env.ASSET_HOST || '',
  cssBundle: minIfProduction('index.css'),
  jsBundle: minIfProduction('index.js'),
  logLevel: process.env.LOG_LEVEL
}

export default conf

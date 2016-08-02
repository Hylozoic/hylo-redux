import { parse } from 'url'

export const environment = process.env.NODE_ENV || 'development'
const isServer = typeof window === 'undefined'

if (isServer && environment === 'development') {
  require('dotenv').load({silent: true})
}

export const useAssetManifest = environment === 'production'
export const assetHost = process.env.ASSET_HOST || ''
export const assetPath = process.env.ASSET_PATH || ''
export const filepickerKey = process.env.FILEPICKER_API_KEY
export const logLevel = process.env.LOG_LEVEL
export const upstreamHost = process.env.UPSTREAM_HOST
export const host = process.env.HOST
export const s3 = {
  bucket: process.env.AWS_S3_BUCKET,
  host: process.env.AWS_S3_HOST
}
export const google = {
  key: process.env.GOOGLE_BROWSER_KEY,
  clientId: process.env.GOOGLE_CLIENT_ID
}
export const facebook = {
  appId: process.env.FACEBOOK_APP_ID
}
export const segment = {
  writeKey: process.env.SEGMENT_KEY
}

const config = {
  environment, useAssetManifest, assetHost, assetPath, filepickerKey, logLevel,
  upstreamHost, host, s3, google, facebook, segment
}

if (!upstreamHost || !parse(upstreamHost).protocol) {
  throw new Error(`bad value for UPSTREAM_HOST: ${upstreamHost}`)
}

if (!isServer) window.__appConfig = config

export default config

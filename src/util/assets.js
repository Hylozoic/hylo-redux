import { info } from '../util/logging'
import { readFileSync } from 'fs'
import request from 'request'

// GASP! A SINGLETON!
var manifest = {}

export const setManifest = data => manifest = data
export const getManifest = () => manifest

const qualifiedUrl = path => {
  const { ASSET_HOST, ASSET_PATH } = process.env
  return `${ASSET_HOST || ''}/${ASSET_PATH}/${path}`
}

export const assetUrl = path => {
  const newPath = manifest[path.replace(/^\//, '')]
  return newPath ? qualifiedUrl(newPath) : path
}

export const setupAssetManifest = callback => {
  if (!process.env.USE_ASSET_MANIFEST) return callback()

  if (process.env.NODE_ENV !== 'production') {
    info('using local asset manifest: dist/manifest.json')
    setManifest(JSON.parse(readFileSync(__dirname + '/../../dist/manifest.json')))
    return callback()
  }

  const url = qualifiedUrl(`manifest-${process.env.SOURCE_VERSION}.json`)
  info(`using asset manifest: ${url}`)
  request.get(url, {json: true}, (err, res) => {
    if (err) throw err
    if (res.statusCode !== 200) throw new Error(`${url} => ${res.statusCode}`)

    setManifest(res.body)
    callback()
  })
}

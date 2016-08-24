import { assetHost, assetPath } from '../config'
import { info } from '../util/logging'
import { readFileSync } from 'fs'
import request from 'request'

// GASP! A SINGLETON!
var manifest = {}

export const setManifest = data => manifest = data
export const getManifest = () => manifest

export const assetUrl = path => {
  path = path.replace(/^\//, '')
  if (!manifest[path]) return path
  return `${assetHost}/${assetPath}/${manifest[path]}`
}

export const setupAssetManifest = callback => {
  if (!process.env.USE_ASSET_MANIFEST) return callback()

  if (process.env.NODE_ENV !== 'production') {
    info('using local asset manifest: dist/manifest.json')
    setManifest(JSON.parse(readFileSync(__dirname + '/../../dist/manifest.json')))
    return callback()
  }

  const url = `${assetHost}/${assetPath}/manifest-${process.env.SOURCE_VERSION}.json`
  info(`using asset manifest: ${url}`)
  request.get(url, {json: true}, (err, res) => {
    if (err) throw err
    if (res.statusCode !== 200) throw new Error(`${url} => ${res.statusCode}`)

    setManifest(res.body)
    callback()
  })
}

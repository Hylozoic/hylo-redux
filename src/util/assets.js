import { assetHost, useAssetManifest } from '../../config'
import { debug } from './logging'

// GASP! A SINGLETON!
var manifest = {}

export const setManifest = data => manifest = data

export const assetUrl = path => {
  if (!useAssetManifest) return path
  let newPath = manifest[path] || path
  debug(`assetUrl: ${path} => ${newPath}`)
  return `${assetHost}/${newPath}`
}

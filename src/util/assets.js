import { assetHost, assetPath, useAssetManifest } from '../../config'
import { debug } from './logging'

// GASP! A SINGLETON!
var manifest = {}

export const setManifest = data => manifest = data

export const getManifest = () => manifest

export const assetUrl = path => {
  if (!useAssetManifest) return path
  path = path.replace(/^\//, '')
  let newPath = `${assetHost}/${assetPath}/${manifest[path] || path}`
  debug(`assetUrl: ${path} => ${newPath}`)
  return newPath
}

// GASP! A SINGLETON!
var manifest = {}

export const setManifest = data => manifest = data
export const getManifest = () => manifest

export const qualifiedUrl = path => {
  // these env vars need to be written out as "process.env.*" in order for the
  // envify transform to replace them correctly (don't use destructuring
  // assignment)
  const host = process.env.ASSET_HOST || ''
  const prefix = process.env.ASSET_PATH
  return `${host}/${prefix}/${path}`
}

export const assetUrl = path => {
  const newPath = manifest[path.replace(/^\//, '')]
  return newPath ? qualifiedUrl(newPath) : path
}

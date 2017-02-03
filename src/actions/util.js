import { find, get } from 'lodash'
import { navigate, showModal } from '../actions'

export const findError = (errors, type, bucket, id) => {
  let match = action =>
    get(action, 'meta.cache.id') === id &&
    get(action, 'meta.cache.bucket') === bucket

  return get(find([errors[type]], match), 'payload.response')
}

export const showImage = (url, fromUrl, isMobile) => {
  const encodeUrl = url => url.replace(/\//g, '%2F')

  if (isMobile) {
    return navigate(`/image/${encodeUrl(url)}/${encodeUrl(fromUrl)}`)
  } else {
    return showModal('image', {url})
  }
}

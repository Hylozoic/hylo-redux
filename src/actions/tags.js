import { cleanAndStringify, createCacheId } from '../util/caching'
import { FETCH_TAGS, REMOVE_TAG } from './index'

export function fetchTags (opts) {
  const { subject, id, limit } = opts
  const offset = opts.offset || 0
  const cacheId = createCacheId(subject, id)

  var path
  if (subject === 'community') {
    path = `/noo/community/${id}/tags`
  }
  path += '?' + cleanAndStringify({limit, offset})

  return {
    type: FETCH_TAGS,
    payload: {api: true, path},
    meta: {
      cache: {id: cacheId, bucket: 'tagsByQuery', limit, offset, array: true}
    }
  }
}

export function removeTagFromCommunity (id, slug) {
  return {
    type: REMOVE_TAG,
    payload: {api: true, path: `/noo/community/${slug}/tag/${id}`, method: 'DELETE'},
    meta: {id, slug}
  }
}

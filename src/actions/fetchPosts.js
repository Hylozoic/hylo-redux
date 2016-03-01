import { cleanAndStringify, createCacheId } from '../util/caching'
import { FETCH_POSTS, CHECK_FRESHNESS } from './index'

export function fetchPosts (opts) {
  let { subject, id, limit, offset, type, sort, search, filter, cacheId } = opts
  if (!offset) offset = 0
  let querystring = cleanAndStringify({offset, limit, type, sort, search, filter})
  let payload = {api: true}

  switch (subject) {
    case 'community':
      payload.path = `/noo/community/${id}/posts`
      break
    case 'person':
      payload.path = `/noo/user/${id}/posts`
      break
    case 'all-posts':
      payload.path = `/noo/user/${id}/all-community-posts`
      break
    case 'followed-posts':
      payload.path = `/noo/user/${id}/followed-posts`
      break
    case 'project':
      payload.path = `/noo/project/${id}/posts`
      break
    case 'network':
      payload.path = `/noo/network/${id}/posts`
      break
  }

  payload.path += '?' + querystring

  var meta = {cache: {id: cacheId, bucket: 'postsByQuery', limit, offset, array: true}}

  return {type: FETCH_POSTS, payload, meta}
}

export function checkFreshness (subject, id, posts, query = {}) {
  let { limit, offset, type, sort, search, filter } = query
  let cacheId = createCacheId(subject, id, query)
  if (!offset) offset = 0
  let querystring = cleanAndStringify({offset, limit, type, sort, search, filter})
  let payload = {api: true, params: {posts}, path: `/noo/freshness/posts/${subject}/${id}`, method: 'POST'}

  payload.path += '?' + querystring

  var meta = {cacheId}

  return {type: CHECK_FRESHNESS, payload, meta}
}

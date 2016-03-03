import { cleanAndStringify, createCacheId } from '../util/caching'
import { FETCH_PEOPLE } from './index'

export function fetchPeople (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!cacheId) cacheId = createCacheId(subject, id, {search})
  if (!offset) offset = 0
  let payload = {api: true}
  let cache = {id: cacheId, bucket: 'peopleByQuery', limit, offset, array: true}
  var querystring

  switch (subject) {
    case 'community':
      querystring = cleanAndStringify({search, limit, offset})
      payload.path = `/noo/community/${id}/members?${querystring}`
      break
    case 'project':
      querystring = cleanAndStringify({search, limit, offset, paginate: true})
      payload.path = `/noo/project/${id}/users?${querystring}`
      break
    case 'network':
      querystring = cleanAndStringify({search, limit, offset})
      payload.path = `/noo/network/${id}/members?${querystring}`
      break
    case 'voters':
      payload.path = `/noo/post/${id}/voters`
      break
  }

  return {type: FETCH_PEOPLE, payload, meta: {cache}}
}

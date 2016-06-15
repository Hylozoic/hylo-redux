import { cleanAndStringify, createCacheId } from '../util/caching'
import { FETCH_PEOPLE } from './index'

export function fetchPeople (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!cacheId) cacheId = createCacheId(subject, id, {search})
  if (!offset) offset = 0
  const cache = {id: cacheId, bucket: 'peopleByQuery', limit, offset, array: true}
  let querystring, path

  switch (subject) {
    case 'community':
      querystring = cleanAndStringify({search, limit, offset})
      path = id === 'all'
        ? `/noo/user?${querystring}`
        : `/noo/community/${id}/members?${querystring}`
      break
    case 'network':
      querystring = cleanAndStringify({search, limit, offset})
      path = `/noo/network/${id}/members?${querystring}`
      break
  }

  return {type: FETCH_PEOPLE, payload: {api: true, path}, meta: {cache}}
}

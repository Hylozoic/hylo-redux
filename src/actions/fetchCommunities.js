import { cleanAndStringify } from '../util/caching'
import { FETCH_COMMUNITIES } from './index'

export function fetchCommunities (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!offset) offset = 0
  let payload = {api: true}
  let cache = {id: cacheId, bucket: 'communitiesByQuery', limit, offset, array: true}
  var querystring

  switch (subject) {
    case 'network':
      querystring = cleanAndStringify({search, limit, offset})
      payload.path = `/noo/network/${id}/communities?${querystring}`
      break

  }

  return {type: FETCH_COMMUNITIES, payload, meta: {cache}}
}

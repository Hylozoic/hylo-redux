import { cleanAndStringify } from '../util/caching'
import { FETCH_PEOPLE } from './index'

export function fetchPeople (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!offset) offset = 0
  let querystring = cleanAndStringify({search, limit, offset})
  let payload = {api: true}
  let cache = {id: cacheId, bucket: 'peopleByQuery', limit, offset, array: true}

  switch (subject) {
    case 'community':
      payload.path = `/noo/community/${id}/members?${querystring}`
      break
    case 'project':
      payload.path = `/noo/project/${id}/users-redux?${querystring}`
      break
  }

  return {type: FETCH_PEOPLE, payload, meta: {cache}}
}

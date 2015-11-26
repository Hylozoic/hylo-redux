import { cleanAndStringify } from '../util/caching'

export const FETCH_PEOPLE = 'FETCH_PEOPLE'

export function fetchPeople (opts) {
  let { subject, id, limit, offset, search, cacheId } = opts
  if (!offset) offset = 0
  let querystring = cleanAndStringify({search, limit, offset})
  let payload = {api: true}
  let cache = {id: cacheId, bucket: 'peopleByQuery', limit, offset, array: true}

  switch (subject) {
    case 'community':
      payload.path = `/noo/community/${id}/members?${querystring}`
  }

  return {type: FETCH_PEOPLE, payload, meta: {cache}}
}

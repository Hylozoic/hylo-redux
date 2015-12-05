import { cleanAndStringify } from '../util/caching'
import { FETCH_PROJECTS } from './index'

export function fetchProjects (opts) {
  let { subject, id, limit, offset, type, sort, search, filter, cacheId } = opts
  if (!offset) offset = 0
  let payload = {api: true}
  let query = {offset, limit, type, sort, search, filter}

  switch (subject) {
    case 'all':
      payload.path = '/noo/project'
      break
    case 'community':
      payload.path = '/noo/project'
      query.communityId = id
      break
  }

  payload.path += '?' + cleanAndStringify(query)

  let cache = {id: cacheId, bucket: 'projectsByQuery', limit, offset, array: true}
  return {type: FETCH_PROJECTS, payload, meta: {cache}}
}

import { cleanAndStringify } from '../util/caching'
import { FETCH_PROJECTS } from './index'

export function fetchProjects (opts) {
  let { subject, id, limit, offset, type, sort, search, filter, cacheId } = opts
  if (!offset) offset = 0
  let querystring = cleanAndStringify({offset, limit, type, sort, search, filter})
  let payload = {api: true}

  switch (subject) {
    case 'all':
      payload.path = '/noo/project'
      break
  }

  payload.path += '?' + querystring

  let cache = {id: cacheId, bucket: 'projectsByQuery', limit, offset, array: true}
  return {type: FETCH_PROJECTS, payload, meta: {cache}}
}

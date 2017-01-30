import { get } from 'lodash/fp'
import { cleanAndStringify } from '../util/caching'
import {
  SEARCH
} from '../constants'

export function search (opts) {
  let { limit, offset, type, q, cacheId } = opts
  if (!offset) offset = 0
  let querystring = cleanAndStringify({q, type, limit, offset})
  let cache = {id: cacheId, bucket: 'searchResultsByQuery', limit, offset, array: true}
  return {
    type: SEARCH,
    payload: {api: true, path: `/noo/search/fulltext?${querystring}`},
    meta: {
      cache,
      addDataToStore: {
        communities: get('communities'),
        people: get('people')
      }
    }
  }
}

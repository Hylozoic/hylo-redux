import { compact, map } from 'lodash/fp'
import { cleanAndStringify } from '../util/caching'
import { FETCH_ACTIVITY } from './index'

export function fetchActivity (offset = 0, resetCount, id = 'all') {
  const limit = 20
  const query = cleanAndStringify({limit, offset, paginate: true, resetCount})
  const path = id !== 'all'
    ? `/noo/community/${id}/activity/?${query}`
    : `/noo/activity?${query}`

  return {
    type: FETCH_ACTIVITY,
    payload: {api: true, path},
    meta: {
      id,
      resetCount,
      cache: {id, bucket: 'activitiesByCommunity', limit, offset, array: true},
      addDataToStore: {
        comments: payload => compact(map('comment', payload.items))
      }
    }
  }
}

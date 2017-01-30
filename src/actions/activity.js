import { compact, map } from 'lodash/fp'
import { cleanAndStringify } from '../util/caching'
import {
  FETCH_ACTIVITY,
  MARK_ACTIVITY_READ,
  MARK_ALL_ACTIVITIES_READ
} from '../constants'

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

export function markActivityRead (activityId) {
  return {
    type: MARK_ACTIVITY_READ,
    payload: {api: true, params: {unread: false}, path: `/noo/activity/${activityId}`, method: 'POST'},
    meta: {activityId}
  }
}

// we don't keep track in an activity object which community (or communities) it
// corresponds to, so we instead assume that this action is only dispatched from
// a component which has a list of activities for the community that we want to
// mark as read, and pass in those activities' IDs.
export function markAllActivitiesRead (communityId, activityIds) {
  const path = `/noo/activity/mark-all-read?communityId=${communityId}`
  return {
    type: MARK_ALL_ACTIVITIES_READ,
    payload: {api: true, path, method: 'POST'},
    meta: {communityId, activityIds}
  }
}

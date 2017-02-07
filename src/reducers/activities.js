import {
  CLEAR_CACHE,
  FETCH_ACTIVITY,
  MARK_ACTIVITY_READ,
  MARK_ALL_ACTIVITIES_READ_PENDING
} from '../actions/constants'
import { includes, omit, map, transform } from 'lodash'
import { mergeList } from './util'

const normalize = activity => {
  let comment = activity.comment
  if (!comment) return activity
  return {...omit(activity, 'comment'), comment_id: comment.id}
}

export const activities = (state = {}, action) => {
  const { type, payload, error, meta } = action
  if (error) return state
  switch (type) {
    case FETCH_ACTIVITY:
      return mergeList(state, payload.items.map(normalize), 'id')
    case MARK_ACTIVITY_READ:
      const id = meta.activityId
      return {
        ...state,
        [id]: {...state[id], unread: false}
      }
    case MARK_ALL_ACTIVITIES_READ_PENDING:
      const { communityId, activityIds } = meta
      // if a community id is specified, mark as read only those activities
      // whose ids have been explicitly passed in the action
      return transform(state, (s, act, k) => {
        s[k] = !communityId || includes(activityIds, act.id)
          ? {...act, unread: false}
          : act
      })
  }
  return state
}

export const activitiesByCommunity = (state = {}, action) => {
  const { type, payload, error, meta } = action
  if (error) return state

  switch (type) {
    case FETCH_ACTIVITY:
      return {
        ...state,
        [meta.id]: (state[meta.id] || []).concat(map(payload.items, 'id'))
      }
    case CLEAR_CACHE:
      if (payload.bucket === 'activitiesByCommunity') {
        return {...state, [payload.id]: null}
      }
      break
  }

  return state
}

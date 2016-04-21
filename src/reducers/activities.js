import {
  FETCH_ACTIVITY,
  MARK_ACTIVITY_READ,
  MARK_ALL_ACTIVITIES_READ_PENDING
} from '../actions'
import { omit, map, transform } from 'lodash'
import { mergeList } from './util'

const normalize = activity => {
  let comment = activity.comment
  if (!comment) return activity
  return {...omit(activity, 'comment'), comment_id: comment.id}
}

export const activities = (state = {}, action) => {
  const { type, payload, error, meta } = action
  if (error) return state
  var activityId
  switch (type) {
    case FETCH_ACTIVITY:
      return mergeList(state, payload.items.map(normalize), 'id')
    case MARK_ACTIVITY_READ:
      activityId = meta.activityId
      return {
        ...state,
        [activityId]: {...state[activityId], unread: false}
      }
    case MARK_ALL_ACTIVITIES_READ_PENDING:
      return transform(state, (s, act, k) => {
        s[k] = {...act, unread: false}
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
  }

  return state
}

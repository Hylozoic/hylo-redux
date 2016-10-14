import { filter, indexOf, mergeWith } from 'lodash'
import { find, get, isNull, omitBy } from 'lodash/fp'
import { normalize } from './people'
import {
  CREATE_COMMUNITY,
  FETCH_ACTIVITY,
  FETCH_CURRENT_USER,
  FETCH_LIVE_STATUS,
  JOIN_COMMUNITY_WITH_CODE,
  LEAVE_COMMUNITY_PENDING,
  LOGIN,
  LOGOUT,
  SIGNUP,
  UPDATE_USER_SETTINGS_PENDING,
  UPDATE_COMMUNITY_SETTINGS_PENDING,
  UPDATE_MEMBERSHIP_SETTINGS_PENDING,
  USE_INVITATION
} from '../actions'

const updateCurrentUser = (user, params) => {
  const updated = mergeWith({...user}, params, (objV, srcV, key, obj, src) => {
    if (key === 'tags') return srcV
  })

  if (get('last_viewed_messages_at', params.settings)) {
    updated.new_message_count = 0
  }

  return updated
}

const normalizeMembership = membership => omitBy(isNull, {
  ...membership,
  community: null,
  left_nav_tags: null
})

const replaceInArray = (arr, oldVal, newVal) => {
  var index = indexOf(arr, oldVal)
  if (index) {
    return arr.slice(0, index)
    .concat([newVal])
    .concat(arr.slice(index + 1))
  } else {
    return arr.concat([newVal])
  }
}

const updateOneMembershipSettings = (memberships, communityId, settings) => {
  const old = find(m => m.community_id === communityId, memberships)
  return replaceInArray(memberships, old,
    {...old, settings: {...old.settings, ...settings}})
}

export default function (state = null, action) {
  const { error, payload, type, meta } = action
  if (error) return state

  if (type === LEAVE_COMMUNITY_PENDING ||
    (type === UPDATE_COMMUNITY_SETTINGS_PENDING && meta.params.active === false)) {
    return {
      ...state,
      memberships: filter(state.memberships, m => m.community_id !== meta.id)
    }
  }

  switch (type) {
    case LOGOUT:
      return null
    case LOGIN:
    case SIGNUP:
    case FETCH_CURRENT_USER:
      return payload ? normalize(payload) : null
    case CREATE_COMMUNITY:
    case JOIN_COMMUNITY_WITH_CODE:
    case USE_INVITATION:
      return {
        ...state,
        memberships: [normalizeMembership(payload), ...state.memberships]
      }
    case FETCH_ACTIVITY:
      return meta.resetCount ? {...state, new_notification_count: 0} : state
    case FETCH_LIVE_STATUS:
      const { new_notification_count } = payload
      return {...state, new_notification_count}
    case UPDATE_MEMBERSHIP_SETTINGS_PENDING:
      return {
        ...state,
        memberships: updateOneMembershipSettings(
          state.memberships,
          meta.communityId,
          meta.params.settings
        )
      }
    case UPDATE_USER_SETTINGS_PENDING:
      return updateCurrentUser(state, meta.params)
  }

  return state
}

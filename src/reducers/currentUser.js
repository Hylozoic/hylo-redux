import { filter, indexOf, mergeWith } from 'lodash'
import { find, isNull, isUndefined, omitBy } from 'lodash/fp'
import { normalize } from './people'
import {
  CREATE_COMMUNITY,
  FETCH_CURRENT_USER,
  JOIN_COMMUNITY_WITH_CODE,
  LEAVE_COMMUNITY_PENDING,
  LOGIN,
  LOGOUT,
  RESET_TOOLTIPS,
  REVOKE_USER_TOKEN,
  SIGNUP,
  UPDATE_USER_SETTINGS_PENDING,
  UPDATE_COMMUNITY_SETTINGS_PENDING,
  UPDATE_MEMBERSHIP_SETTINGS_PENDING,
  USE_INVITATION
} from '../actions'

const normalizeCurrentUser = user =>
  omitBy(x => isNull(x) || isUndefined(x), {
    ...normalize(user),
    new_notification_count: null,
    new_message_count: null
  })

const updateCurrentUser = (user, params) => {
  const updated = mergeWith({...user}, params, (objV, srcV, key, obj, src) => {
    if (key === 'tags') return srcV
  })

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
      return payload ? normalizeCurrentUser(payload) : null
    case CREATE_COMMUNITY:
    case JOIN_COMMUNITY_WITH_CODE:
    case USE_INVITATION:
      return {
        ...state,
        memberships: [normalizeMembership(payload), ...state.memberships]
      }
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
    case RESET_TOOLTIPS:
      return {
        ...state,
        settings: {
          ...state.settings,
          viewedTooltips: {}
        }
      }
    case REVOKE_USER_TOKEN:
      return {
        ...state,
        token: false
      }
  }

  return state
}

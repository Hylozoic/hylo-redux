import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { some, get, includes, omit, partition } from 'lodash'
import comments from './comments'
import commentsByPost from './commentsByPost'
import communities from './communities'
import communitiesByQuery from './communitiesByQuery'
import networks from './networks'
import networkEdits from './networkEdits'
import people from './people'
import peopleByQuery from './peopleByQuery'
import postEdits from './postEdits'
import postsByQuery from './postsByQuery'
import posts from './posts'
import projectsByQuery from './projectsByQuery'
import projects from './projects'
import projectEdits from './projectEdits'
import { appendUniq } from './util'

import {
  CANCEL_TYPEAHEAD,
  CHECK_FRESHNESS_POSTS,
  CLEAR_CACHE,
  CREATE_COMMUNITY,
  CREATE_POST,
  CREATE_NETWORK,
  FETCH_ACTIVITY,
  FETCH_LIVE_STATUS,
  FETCH_COMMUNITIES,
  FETCH_INVITATIONS,
  FETCH_ONBOARDING,
  FETCH_PEOPLE,
  FETCH_POSTS,
  FETCH_PROJECTS,
  FETCH_TAG,
  LOGIN,
  LOGOUT,
  MARK_ACTIVITY_READ,
  MARK_ALL_ACTIVITIES_READ_PENDING,
  NAVIGATE,
  NOTIFY,
  REMOVE_NOTIFICATION,
  RESET_ERROR,
  RESET_COMMUNITY_VALIDATION,
  RESET_NETWORK_VALIDATION,
  SEARCH,
  SEND_COMMUNITY_INVITATION,
  SEND_PROJECT_INVITE,
  SET_CURRENT_COMMUNITY_ID,
  SET_LOGIN_ERROR,
  SET_META_TAGS,
  SET_SIGNUP_ERROR,
  SIGNUP,
  TOGGLE_MAIN_MENU,
  TOGGLE_USER_SETTINGS_SECTION,
  TYPEAHEAD,
  UPDATE_COMMUNITY_EDITOR,
  UPDATE_NETWORK_EDITOR,
  UPDATE_INVITATION_EDITOR,
  UPDATE_POST,
  UPDATE_PROJECT_INVITE,
  UPLOAD_IMAGE,
  VALIDATE_COMMUNITY_ATTRIBUTE,
  VALIDATE_COMMUNITY_ATTRIBUTE_PENDING,
  VALIDATE_NETWORK_ATTRIBUTE,
  VALIDATE_NETWORK_ATTRIBUTE_PENDING
} from '../actions'

const keyedCounter = (actionType, payloadKey, statePath = 'meta.cache.id') =>
  (state = {}, action) => {
    let { type, payload, error } = action
    if (error) return state
    if (type === actionType) {
      return {...state, [get(action, statePath)]: Number(payload[payloadKey])}
    }
    return state
  }

const keyedHasFreshItems = (actionType, bucket) =>
  (state = {}, action) => {
    let { type, payload, error, meta } = action
    if (error) return state
    if (type === actionType) {
      return {...state, [meta.cacheId]: payload}
    }
    if (type === CLEAR_CACHE && payload.bucket === bucket) {
      return {...state, [payload.id]: false}
    }
    return state
  }

export default combineReducers({
  currentCommunityId: (state = null, action) => {
    let { error, type, payload } = action
    if (error) return state

    switch (type) {
      case SET_CURRENT_COMMUNITY_ID:
        return payload
    }

    return state
  },

  leftNavOpened: (state = true, action) => {
    let { error, type } = action
    if (error) return state

    switch (type) {
      case TOGGLE_MAIN_MENU:
        return !state
    }

    return state
  },

  errors: (state = {}, action) => {
    let { error, type, payload, meta } = action

    switch (type) {
      case RESET_ERROR:
        return {...state, [meta.type]: null}
    }

    if (!error) return state

    return {...state, [type]: {error, payload, meta}}
  },

  routing: (state = {path: '/'}, action) => {
    if (action.error) return state

    switch (action.type) {
      case LOGOUT:
        return {path: '/login'}
      case NAVIGATE:
        return {path: action.payload}
      default:
        return routeReducer(state, action)
    }
  },

  login: (state = {}, action) => {
    let { type, payload, error } = action
    switch (type) {
      case LOGIN:
        if (error) return {error: payload.message}
        break
      case SET_LOGIN_ERROR:
        if (payload) return {error: payload}
    }
    return state
  },

  signup: (state = {}, action) => {
    let { type, payload, error } = action
    switch (type) {
      case SIGNUP:
        if (error) return {error: payload.message}
        break
      case SET_SIGNUP_ERROR:
        if (payload) return {error: payload}
    }
    return state
  },

  comments,
  commentsByPost,
  communities,
  communitiesByQuery,
  networks,
  networkEdits,
  people,
  peopleByQuery,
  posts,
  postsByQuery,
  postEdits,
  projects,
  projectsByQuery,
  projectEdits,

  pending: (state = {}, action) => {
    let { type, meta } = action

    let toggle = (targetType, useMeta) => {
      if (type === targetType) return {...state, [targetType]: false}
      if (type === targetType + '_PENDING') {
        return {...state, [targetType]: (useMeta && meta ? meta : true)}
      }
    }

    return toggle(FETCH_POSTS) ||
      toggle(FETCH_PEOPLE) ||
      toggle(UPLOAD_IMAGE, true) ||
      toggle(CREATE_POST) ||
      toggle(UPDATE_POST) ||
      toggle(FETCH_PROJECTS) ||
      toggle(CREATE_COMMUNITY) ||
      toggle(CREATE_NETWORK) ||
      toggle(FETCH_ACTIVITY) ||
      toggle(SEND_COMMUNITY_INVITATION) ||
      toggle(FETCH_INVITATIONS) ||
      toggle(FETCH_COMMUNITIES) ||
      toggle(SEND_PROJECT_INVITE) ||
      toggle(SEARCH) ||
      state
  },

  typeaheadMatches: (state = {}, action) => {
    let { error, type } = action
    if (error || !includes([TYPEAHEAD, CANCEL_TYPEAHEAD], type)) return state

    let { payload, meta: { id } } = action
    switch (type) {
      case TYPEAHEAD:
        return {...state, [id]: payload}
      case CANCEL_TYPEAHEAD:
        return {...state, [id]: []}
    }

    return state
  },

  hasFreshPostsByQuery: keyedHasFreshItems(CHECK_FRESHNESS_POSTS, 'postsByQuery'),

  totalPostsByQuery: keyedCounter(FETCH_POSTS, 'posts_total'),
  totalPeopleByQuery: keyedCounter(FETCH_PEOPLE, 'people_total'),
  totalProjectsByQuery: keyedCounter(FETCH_PROJECTS, 'projects_total'),
  totalCommunitiesByQuery: keyedCounter(FETCH_COMMUNITIES, 'communities_total'),

  communityValidation: (state = {}, action) => {
    let { type, payload, error, meta } = action
    if (error) return state

    switch (type) {
      case VALIDATE_COMMUNITY_ATTRIBUTE_PENDING:
        return {
          ...state,
          pending: {...state.pending, [meta.key]: true}
        }
      case VALIDATE_COMMUNITY_ATTRIBUTE:
        return {
          ...state,
          [meta.key]: payload,
          pending: {...state.pending, [meta.key]: false}
        }
      case RESET_COMMUNITY_VALIDATION:
        return {...state, [meta.key]: null}
    }

    return state
  },

  communityEditor: (state = {}, action) => {
    let { type, payload, meta, error } = action
    if (error) {
      switch (type) {
        case CREATE_COMMUNITY:
          return {
            ...state,
            errors: {...state.errors, server: `Server error: ${payload.message}`}
          }
        default:
          return state
      }
    }

    switch (type) {
      case UPDATE_COMMUNITY_EDITOR:
        return {
          ...state,
          [meta.subtree]: {...state[meta.subtree], ...payload}
        }
      case UPLOAD_IMAGE:
        if (meta.id !== 'new') break
        if (meta.subject === 'community-avatar') {
          return {
            ...state,
            community: {...state.community, avatar_url: payload}
          }
        } else if (meta.subject === 'community-banner') {
          return {
            ...state,
            community: {...state.community, banner_url: payload}
          }
        }
    }

    return state
  },

  networkValidation: (state = {}, action) => {
    let { type, payload, error, meta } = action
    let { id, key } = meta || {}
    if (error) return state

    switch (type) {
      case VALIDATE_NETWORK_ATTRIBUTE_PENDING:
        return {
          ...state,
          [id]: {...state[id], pending: {...(state[id] || {}).pending, [key]: true}}
        }
      case VALIDATE_NETWORK_ATTRIBUTE:
        return {
          ...state,
          [id]: {
            ...state[id],
            [key]: payload,
            pending: {...state[id].pending, [key]: false}
          }
        }
      case RESET_NETWORK_VALIDATION:
        return {
          ...state,
          [id]: {...state[id], [key]: null}
        }
    }

    return state
  },

  networkEditor: (state = {}, action) => {
    let { type, payload, meta, error } = action
    if (error) {
      switch (type) {
        case CREATE_NETWORK:
          return {
            ...state,
            errors: {...state.errors, server: `Server error: ${payload.message}`}
          }
        default:
          return state
      }
    }

    switch (type) {
      case UPDATE_NETWORK_EDITOR:
        return {
          ...state,
          [meta.subtree]: {...state[meta.subtree], ...payload}
        }
      case UPLOAD_IMAGE:
        if (meta.id !== 'new') break
        if (meta.subject === 'network-avatar') {
          return {
            ...state,
            network: {...state.network, avatar_url: payload}
          }
        } else if (meta.subject === 'network-banner') {
          return {
            ...state,
            network: {...state.network, banner_url: payload}
          }
        }
    }

    return state
  },

  projectInvite: (state = {}, action) => {
    let { type, payload, error, meta } = action
    let { id } = meta || {}
    if (error) return state
    switch (type) {
      case UPDATE_PROJECT_INVITE:
        return {
          ...state,
          [id]: {...state[id], ...payload}
        }
    }

    return state
  },

  userSettingsEditor: (state = {}, action) => {
    let { type, payload, error, meta } = action
    if (error) return state

    switch (type) {
      case TOGGLE_USER_SETTINGS_SECTION:
        return {
          ...state,
          expand: {...state.expand, [payload]: meta.forceOpen || !get(state.expand, payload)}
        }
    }
    return state
  },

  activities: (state = [], action) => {
    let { type, payload, error, meta } = action
    if (error) return state
    let normalize = activity => {
      let comment = activity.comment
      if (!comment) {
        return activity
      }
      return {...omit(activity, 'comment'), comment_id: comment.id}
    }
    var activityId
    switch (type) {
      case FETCH_ACTIVITY:
        return state.concat(payload.items.map(normalize))
      case MARK_ACTIVITY_READ:
        activityId = meta.activityId
        return state.map(a => a.id === activityId ? {...a, unread: false} : a)
      case MARK_ALL_ACTIVITIES_READ_PENDING:
        return state.map(a => ({...a, unread: false}))
    }
    return state
  },

  totalActivities: (state = 0, action) => {
    let { type, payload, error } = action
    if (error) return state
    switch (type) {
      case FETCH_ACTIVITY:
        return payload.total
    }
    return state
  },

  metaTags: (state = {}, action) => {
    let { type, payload } = action
    if (type === SET_META_TAGS) {
      return payload
    }

    return state
  },

  invitations: (state = {}, action) => {
    let { type, payload, error, meta } = action
    if (error) return state

    switch (type) {
      case FETCH_INVITATIONS:
        let { communityId, reset } = meta
        if (reset) return {...state, [communityId]: payload.items}
        return {
          ...state,
          [communityId]: [...(state[communityId] || []), ...payload.items]
        }
    }

    return state
  },

  totalInvitations: keyedCounter(FETCH_INVITATIONS, 'total', 'meta.communityId'),

  invitationEditor: (state = {}, action) => {
    let { type, payload, error } = action
    if (error) return state
    switch (type) {
      case UPDATE_INVITATION_EDITOR:
        return {...state, [payload.field]: payload.value}
      case SEND_COMMUNITY_INVITATION:
        let { results } = payload
        let [ failures, successes ] = partition(results, r => r.error)
        let success, error
        let sl = successes.length
        if (sl > 0) {
          let pl = sl > 1
          success = `Sent invitation${pl ? 's' : ''} to ${sl} ${pl ? 'people' : 'person'}.`
        }
        if (some(failures)) {
          error = failures.map(r => `Couldn't send to ${r.email}: ${r.error}.`).join(' ')
        }
        return {...state, success, error}
    }
    return state
  },

  notifierMessages: (state = [], action) => {
    let { type, payload, error } = action
    if (error) return state
    switch (type) {
      case NOTIFY:
        return [payload, ...state]
      case REMOVE_NOTIFICATION:
        return state.filter(n => n.id !== payload)
    }

    return state
  },

  onboarding: (state = {}, action) => {
    let { type, payload, error } = action
    if (error) return state
    switch (type) {
      case FETCH_ONBOARDING:
        return payload
    }
    return state
  },

  searchResultsByQuery: (state = {}, action) => {
    let { type, payload, meta, error } = action
    if (error) return state
    switch (type) {
      case SEARCH:
        return appendUniq(state, meta.cache.id, payload.items)
    }
    return state
  },

  totalSearchResultsByQuery: keyedCounter(SEARCH, 'total'),

  pageTitle: (state = 'Hylo', action) => {
    let updateTitle = (title, count) => {
      let split = title.split(') ')
      let words = split.length > 1 ? split[1] : split[0]
      return (count > 0 ? `(${count}) ` : '') + words
    }

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_ACTIVITY:
        if (meta.resetCount) {
          return updateTitle(state, 0)
        }
        break
      case FETCH_LIVE_STATUS:
        return updateTitle(state, payload.new_notification_count)
    }
    return state
  },

  tagsByCommunity: (state = {}, action) => {
    // meta.id here is whatever params.id is in CommunityProfile
    let { type, payload, meta } = action
    switch (type) {
      case FETCH_TAG:
        let oldCommunityTags = state[meta.id] || {}
        return {
          ...state,
          [meta.id]: {
            ...oldCommunityTags,
            [meta.tagName]: payload
          }
        }
    }
    return state
  }

})

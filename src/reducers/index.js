import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { some, includes, partition, transform } from 'lodash'
import { filter, flow, get, map, compact } from 'lodash/fp'
import { activities, activitiesByCommunity } from './activities'
import comments from './comments'
import commentEdits from './commentEdits'
import commentsByPost from './commentsByPost'
import communities from './communities'
import communitiesByQuery from './communitiesByQuery'
import communitiesForNetworkNav from './communitiesForNetworkNav'
import messageEdits from './messageEdits'
import networks from './networks'
import networkEdits from './networkEdits'
import newMessageCount from './newMessageCount'
import people from './people'
import peopleByQuery from './peopleByQuery'
import postEdits, {
  editingTagDescriptions, creatingTagAndDescription, tagDescriptionEdits
} from './postEdits'
import postsByQuery from './postsByQuery'
import { tagsByCommunity, tagsByQuery, totalTagsByQuery } from './tags'
import tagInvitationEditor from './tagInvitationEditor'
import posts from './posts'
import pending from './pending'
import tooltips from './tooltips'
import {
  appendPayloadByPath, keyedCounter, keyedCount, composeReducers, handleSetState
} from './util'
import { admin } from './admin'

import {
  ADD_DATA_TO_STORE,
  APPEND_THREAD,
  APPROVE_JOIN_REQUEST_PENDING,
  APPROVE_ALL_JOIN_REQUESTS_PENDING,
  CANCEL_POST_EDIT,
  CANCEL_TYPEAHEAD,
  CHECK_FRESHNESS_POSTS,
  CLEAR_INVITATION_EDITOR,
  CLOSE_MODAL,
  CONTINUE_LOGIN,
  CREATE_COMMUNITY,
  CREATE_NETWORK,
  FETCH_ACTIVITY,
  FETCH_COMMUNITIES,
  FETCH_CURRENT_USER,
  FETCH_INVITATIONS,
  FETCH_JOIN_REQUESTS,
  FETCH_LIVE_STATUS,
  FETCH_PEOPLE,
  FETCH_POSTS,
  FETCH_THANKS,
  FETCH_CONTRIBUTIONS,
  FIND_OR_CREATE_THREAD,
  FINISH_LOGIN,
  HIDE_POPOVER,
  LOCATION_CHANGE,
  LOGIN,
  NOTIFY,
  ON_THREAD_PAGE,
  OFF_THREAD_PAGE,
  REMOVE_COMMUNITY_MEMBER_PENDING,
  REMOVE_NOTIFICATION,
  RESEND_ALL_COMMUNITY_INVITATIONS_PENDING,
  RESET_ERROR,
  RESET_COMMUNITY_VALIDATION,
  RESET_NETWORK_VALIDATION,
  SEARCH,
  SEND_COMMUNITY_INVITATION,
  SET_CURRENT_COMMUNITY_ID,
  SET_CURRENT_NETWORK_ID,
  SET_LOGIN_ERROR,
  SET_META_TAGS,
  SET_MOBILE_DEVICE,
  SET_SIGNUP_ERROR,
  SHOW_ALL_TAGS,
  SHOW_DIRECT_MESSAGE,
  SHOW_EXPANDED_POST,
  SHOW_MODAL,
  SHOW_SHARE_TAG,
  SHOW_POPOVER,
  SIGNUP,
  TOGGLE_LEFT_NAV,
  TOGGLE_USER_SETTINGS_SECTION,
  TYPEAHEAD,
  UPDATE_COMMUNITY_EDITOR,
  UPDATE_NETWORK_EDITOR,
  UPDATE_INVITATION_EDITOR,
  UPLOAD_IMAGE,
  VALIDATE_COMMUNITY_ATTRIBUTE,
  VALIDATE_COMMUNITY_ATTRIBUTE_PENDING,
  VALIDATE_NETWORK_ATTRIBUTE,
  VALIDATE_NETWORK_ATTRIBUTE_PENDING
} from '../actions/constants'

const combinedReducers = combineReducers({
  isMobile: (state = false, action) => {
    return action.type === SET_MOBILE_DEVICE ? action.payload : state
  },

  currentCommunityId: (state = null, action) => {
    let { error, type, payload } = action
    if (error) return state

    switch (type) {
      case SET_CURRENT_COMMUNITY_ID:
        return payload
      case SET_CURRENT_NETWORK_ID:
        return null
    }

    return state
  },

  currentNetworkId: (state = null, action) => {
    let { error, type, payload } = action
    if (error) return state

    switch (type) {
      case SET_CURRENT_NETWORK_ID:
        return payload
      case SET_CURRENT_COMMUNITY_ID:
        return null
    }

    return state
  },

  threadsByUser: (state = {}, action) => {
    let { error, type, payload, meta } = action
    if (error) return state

    switch (type) {
      case APPEND_THREAD:
        return {...state, [payload.user_id]: payload.id} // NOTE: key needs to reflect multi-person threads when we build it
      case FIND_OR_CREATE_THREAD:
        return {...state, [meta.messageTo]: payload.id}
    }

    return state
  },

  leftNavIsOpen: (state = false, action) => {
    let { error, type } = action
    if (error) return state

    switch (type) {
      case TOGGLE_LEFT_NAV:
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

  login: (state = {}, action) => {
    let { type, payload, error } = action
    switch (type) {
      case LOGIN:
        if (error) return {error: payload.message}
        break
      case SET_LOGIN_ERROR:
        if (payload) return {error: payload}
        break
      case CONTINUE_LOGIN:
        return {...state, shouldRedirect: true, query: payload}
      case FINISH_LOGIN:
        return {}
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

  openedThreadId: (state = null, action) => {
    let { type, payload } = action
    switch (type) {
      case ON_THREAD_PAGE:
        return payload.id
      case OFF_THREAD_PAGE:
        return null
    }
    return state
  },

  activities,
  activitiesByCommunity,
  admin,
  comments,
  commentEdits,
  commentsByPost,
  communities,
  communitiesByQuery,
  communitiesForNetworkNav,
  editingTagDescriptions,
  countFreshPostsByQuery: keyedCount(CHECK_FRESHNESS_POSTS, 'postsByQuery'),
  creatingTagAndDescription,
  messageEdits,
  networks,
  networkEdits,
  newMessageCount,
  pending,
  people,
  peopleByQuery,
  posts,
  postsByQuery,
  postEdits,
  routing: routerReducer,
  searchResultsByQuery: appendPayloadByPath(SEARCH, 'meta.cache.id', 'items'),

  popover: (state = {}, action) => {
    switch (action.type) {
      case SHOW_POPOVER:
        return action.payload
      case LOCATION_CHANGE:
      case HIDE_POPOVER:
        return {}
    }

    return state
  },

  tagsByCommunity,
  tagsByQuery,
  tagDescriptionEdits,
  tagInvitationEditor,
  thanks: appendPayloadByPath(FETCH_THANKS, 'meta.id'),
  contributions: appendPayloadByPath(FETCH_CONTRIBUTIONS, 'meta.id'),
  tooltips,
  totalActivities: keyedCounter(FETCH_ACTIVITY, 'total', 'meta.id'),
  totalCommunitiesByQuery: keyedCounter(FETCH_COMMUNITIES, 'communities_total'),
  totalInvitations: keyedCounter(FETCH_INVITATIONS, 'total', 'meta.communityId'),
  totaljoinRequests: keyedCounter(FETCH_JOIN_REQUESTS, 'total', 'meta.communityId'),
  totalPostsByQuery: keyedCounter(FETCH_POSTS, 'posts_total'),

  totalPeopleByQuery: composeReducers(
    keyedCounter(FETCH_PEOPLE, 'total'),
    (state, { type, meta, payload }) => {
      switch (type) {
        case ADD_DATA_TO_STORE:
          if (meta.bucket === 'totalPeopleByQuery') {
            return {...state, ...payload}
          }
          break
        case REMOVE_COMMUNITY_MEMBER_PENDING:
          return {...state, [meta.cacheId]: state[meta.cacheId] - 1}
      }
      return state
    }
  ),

  totalSearchResultsByQuery: keyedCounter(SEARCH, 'total'),
  totalTagsByQuery,

  typeaheadMatches: (state = {}, action) => {
    let { error, type, payload, meta } = action
    if (error) return state

    switch (type) {
      case TYPEAHEAD:
        return {...state, [meta.id]: payload}
      case CANCEL_TYPEAHEAD:
      case CANCEL_POST_EDIT:
        return {...state, [meta.id]: []}
    }

    return state
  },

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
      case CREATE_COMMUNITY:
        return {}
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

  userSettingsEditor: (state = {}, action) => {
    let { type, payload, error, meta } = action
    if (error) return state

    switch (type) {
      case TOGGLE_USER_SETTINGS_SECTION:
        return {
          ...state,
          expand: {
            ...state.expand,
            [payload]: meta.forceOpen || !get(payload, state.expand)
          }
        }
    }
    return state
  },

  metaTags: (state = {}, action) => {
    let { type, payload } = action
    if (type === SET_META_TAGS) {
      // remove closing script tags to prevent js error
      // https://groups.google.com/a/chromium.org/forum/#!topic/chromium-extensions/6bRq60rgBWk
      return transform(payload, (acc, val, key) =>
        acc[key] = typeof val === 'string'
          ? val.replace('</script>', '')
          : val)
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
      case SEND_COMMUNITY_INVITATION:
        communityId = meta.communityId
        const newInvitations = flow(
          map('email'),
          compact,
          map(email => ({email, created_at: new Date()}))
        )(payload.results)
        return {
          ...state,
          [communityId]: [...newInvitations, ...(state[communityId] || [])]
        }
      case RESEND_ALL_COMMUNITY_INVITATIONS_PENDING:
        communityId = meta.communityId
        return {
          ...state,
          [communityId]: map(i => i.user ? i : ({...i, created_at: new Date()}), (state[communityId]) || [])
        }
    }

    return state
  },

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
      case CLEAR_INVITATION_EDITOR:
        return {}
    }
    return state
  },

  joinRequests: (state = {}, action) => {
    let { type, payload, error, meta } = action
    if (error) return state

    switch (type) {
      case FETCH_JOIN_REQUESTS:
        let { communityId, reset } = meta
        if (reset) return {...state, [communityId]: payload.items}
        return {
          ...state,
          [communityId]: payload.items
        }
      case APPROVE_JOIN_REQUEST_PENDING:
        let { userId, slug } = meta
        return {
          ...state,
          [slug]: filter(j => j.user.id !== userId, state[slug])
        }
      case APPROVE_ALL_JOIN_REQUESTS_PENDING:
        return {
          ...state,
          [meta.slug]: []
        }
    }

    return state
  },

  notifierMessages: (state = [], action) => {
    let { type, payload, error } = action
    if (error) return state
    switch (type) {
      case NOTIFY:
        if (payload.singleton) {
          if (state.find(n => n.singleton && n.text === payload.text)) {
            return state
          }
        }
        return [payload, ...state]
      case REMOVE_NOTIFICATION:
        return state.filter(n => n.id !== payload)
    }

    return state
  },

  openModals: (state = [], { type, payload, meta }) => {
    switch (type) {
      case SHOW_MODAL:
        return state.concat({type: meta.name, params: payload})
      case SHOW_ALL_TAGS:
        return state.concat({type: 'tags', params: payload})
      case SHOW_SHARE_TAG:
        return state.concat({type: 'share-tag', params: payload})
      case SHOW_EXPANDED_POST:
        return state.concat({type: 'expanded-post', params: payload})
      case SHOW_DIRECT_MESSAGE:
        return state.concat({type: 'direct-message', params: payload})
      case CLOSE_MODAL:
        return state.slice(0, -1)
      case LOCATION_CHANGE:
        return []
    }

    return state
  },

  newNotificationCount: (state = 0, action) => {
    const { type, error, payload } = action
    if (error) return state
    if (type === FETCH_ACTIVITY && action.meta.resetCount) {
      return 0
    }
    if (includes([LOGIN, SIGNUP, FETCH_CURRENT_USER, FETCH_LIVE_STATUS], type)) {
      return get('new_notification_count', payload) || state
    }
    return state
  }
})

export default composeReducers(combinedReducers, handleSetState)

import { combineReducers } from 'redux'
import { routerReducer } from 'react-router-redux'
import { some, get, partition, transform } from 'lodash'
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
  FETCH_INVITATIONS,
  FETCH_PEOPLE,
  FETCH_POSTS,
  FETCH_THANKS,
  FIND_OR_CREATE_THREAD,
  FINISH_LOGIN,
  HIDE_TAG_POPOVER,
  LOGIN,
  NAVIGATE,
  NOTIFY,
  REMOVE_NOTIFICATION,
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
  SHOW_TAG_POPOVER,
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
} from '../actions'

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
  pending,
  people,
  peopleByQuery,
  posts,
  postsByQuery,
  postEdits,
  routing: routerReducer,
  searchResultsByQuery: appendPayloadByPath(SEARCH, 'meta.cache.id', 'items'),

  tagPopover: (state = {}, action) => {
    switch (action.type) {
      case SHOW_TAG_POPOVER:
        return action.payload
      case NAVIGATE:
      case HIDE_TAG_POPOVER:
        return {}
    }

    return state
  },

  tagsByCommunity,
  tagsByQuery,
  tagDescriptionEdits,
  tagInvitationEditor,
  thanks: appendPayloadByPath(FETCH_THANKS, 'meta.id'),
  tooltips,
  totalActivities: keyedCounter(FETCH_ACTIVITY, 'total', 'meta.id'),
  totalCommunitiesByQuery: keyedCounter(FETCH_COMMUNITIES, 'communities_total'),
  totalInvitations: keyedCounter(FETCH_INVITATIONS, 'total', 'meta.communityId'),
  totalPostsByQuery: keyedCounter(FETCH_POSTS, 'posts_total'),
  totalPeopleByQuery: keyedCounter(FETCH_PEOPLE, 'total'),
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
          expand: {...state.expand, [payload]: meta.forceOpen || !get(state.expand, payload)}
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

  openModals: (state = [], action) => {
    switch (action.type) {
      case SHOW_MODAL:
        return state.concat({type: action.meta.name, params: action.payload})
      case SHOW_ALL_TAGS:
        return state.concat({type: 'tags'})
      case SHOW_SHARE_TAG:
        return state.concat({type: 'share-tag', params: action.payload})
      case SHOW_EXPANDED_POST:
        return state.concat({type: 'expanded-post', params: action.payload})
      case SHOW_DIRECT_MESSAGE:
          return state.concat({type: 'direct-message', params: action.payload})
      case CLOSE_MODAL:
        return state.slice(0, -1)
    }

    return state
  }
})

export default composeReducers(combinedReducers, handleSetState)

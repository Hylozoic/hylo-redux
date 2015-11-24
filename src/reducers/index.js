import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { uniq } from 'lodash'
import { debug } from '../util/logging'

import {
  FETCH_COMMUNITY,
  FETCH_CURRENT_USER,
  FETCH_POSTS,
  FETCH_USER,
  FETCH_COMMENTS,
  CREATE_COMMENT,
  LOGIN,
  LOGOUT,
  NAVIGATE,
  TYPEAHEAD,
  CANCEL_TYPEAHEAD,
  UPDATE_POST_EDITOR,
  CREATE_POST
} from '../actions'

// for pagination -- append a new page of data to existing data if present,
// removing any duplicates.
function appendUniq (state, key, data) {
  let existing = state[key] || []
  return {
    ...state,
    [key]: uniq([...existing, ...data], (v, i) => v.id)
  }
}

export default combineReducers({
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
    if (type === LOGIN) {
      if (error) return {error: payload.message}
      return {success: true}
    }
    return state
  },

  users: (state = {}, action) => {
    let { type, error, payload } = action
    if (error) return state

    if (type === LOGOUT) {
      let currentUser = state.current
      if (!currentUser) return state

      debug('un-caching user:', currentUser.id)
      return {
        ...state,
        current: null,
        [currentUser.id]: null
      }
    }

    if (!payload) return state

    switch (type) {
      case FETCH_USER:
        debug('caching user:', payload.id)
        return {
          ...state,
          [payload.id]: payload
        }
      case LOGIN:
      case FETCH_CURRENT_USER:
        debug('caching user:', payload.id)
        return {
          ...state,
          [payload.id]: payload,
          current: payload
        }
    }

    return state
  },

  communities: (state = {}, action) => {
    if (action.error) return state

    switch (action.type) {
      case FETCH_COMMUNITY:
        let community = action.payload
        debug('caching community:', community.slug)
        return {
          ...state,
          [community.slug]: community
        }
    }

    return state
  },

  posts: (state = {}, action) => {
    if (action.error) return state

    let { type, payload } = action
    switch (type) {
      case FETCH_POSTS:
        let posts = payload.posts.reduce((m, p) => {
          m[p.id] = p
          return m
        }, {})
        debug(`caching ${payload.posts.length} posts`)
        return {
          ...state,
          ...posts
        }
      case CREATE_POST:
        return {
          ...state,
          [payload.id]: payload
        }
    }

    return state
  },

  totalPostsByCommunity: (state = {}, action) => {
    let { type, payload, meta, error } = action
    if (type === FETCH_POSTS && !error && meta && meta.subject === 'community') {
      return {
        ...state,
        [meta.id]: payload.posts_total
      }
    }
    return state
  },

  postsByCommunity: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_POSTS:
        if (meta.subject === 'community') {
          return appendUniq(state, meta.id, payload.posts)
        }
        break
      case CREATE_POST:
        let updatedCommunities = payload.communities.reduce((m, c) => {
          if (state[c.slug]) {
            m[c.slug] = [payload].concat(state[c.slug])
          }
          return m
        }, {})
        return {...state, ...updatedCommunities}
    }

    return state
  },

  pending: (state = {}, action) => {
    switch (action.type) {
      case 'FETCH_POSTS_PENDING':
        return {
          ...state,
          [FETCH_POSTS]: true
        }
      case FETCH_POSTS:
        return {
          ...state,
          [FETCH_POSTS]: false
        }
    }
    return state
  },

  commentsByPost: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_COMMENTS:
        if (meta.subject === 'post') {
          return appendUniq(state, meta.id, payload)
        }
        break
      case CREATE_COMMENT:
        return appendUniq(state, meta.id, [payload])
    }

    return state
  },

  typeaheadMatches: (state = [], action) => {
    if (action.error) return state

    let { type, payload } = action
    switch (type) {
      case TYPEAHEAD:
        return payload
      case CANCEL_TYPEAHEAD:
        return []
    }

    return state
  },

  postEditor: (state = {}, action) => {
    if (action.error) return state

    let { type, payload } = action
    switch (type) {
      case UPDATE_POST_EDITOR:
        return {...state, ...payload}
      case CREATE_POST:
        return {}
    }

    return state
  }
})

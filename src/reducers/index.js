import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { isEmpty, uniq } from 'lodash'
import { debug } from '../util/logging'

import {
  FETCH_COMMUNITY,
  FETCH_CURRENT_USER,
  FETCH_POSTS,
  FETCH_USER,
  LOGIN,
  LOGOUT,
  NAVIGATE
} from '../actions'

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

      debug('un-cached user:', currentUser.id)
      return {
        ...state,
        current: null,
        [currentUser.id]: null
      }
    }

    let user = isEmpty(payload) ? null : payload
    if (!user) return state

    switch (type) {
      case FETCH_USER:
        debug('cached user:', user.id)
        return {
          ...state,
          [user.id]: user
        }
      case LOGIN:
      case FETCH_CURRENT_USER:
        debug('cached user:', user.id)
        return {
          ...state,
          [user.id]: user,
          current: user
        }
    }

    return state
  },

  communities: (state = {}, action) => {
    if (action.error) return state

    switch (action.type) {
      case FETCH_COMMUNITY:
        let community = action.payload
        debug('cached community:', community.slug)
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
        debug(`cached ${payload.posts.length} posts`)
        return {
          ...state,
          ...posts
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

    let { meta, payload } = action
    switch (action.type) {
      case FETCH_POSTS:
        if (meta && meta.subject === 'community') {
          let existingPosts = state[meta.id] || []
          return {
            ...state,
            [meta.id]: uniq([...existingPosts, ...payload.posts], (v, i) => v.id)
          }
        }
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
  }
})

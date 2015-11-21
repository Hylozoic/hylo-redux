import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { FETCH_COMMUNITY, FETCH_CURRENT_USER, FETCH_POSTS, FETCH_USER, LOGIN, LOGOUT } from '../actions'
import { isEmpty, uniq } from 'lodash'

export default combineReducers({
  routing: (state = {path: '/'}, action) => {
    if (action.error) return state

    switch (action.type) {
      case LOGIN:
        return {path: `/u/${action.payload.id}`}
      case LOGOUT:
        return {path: '/'}
      default:
        return routeReducer(state, action)
    }
  },

  loginError: (state = null, action) => {
    if (action.type === LOGIN && action.error) {
      return action.payload.message
    }
    return state
  },

  currentUser: (state = null, action) => {
    if (action.error) return state

    switch (action.type) {
      case LOGIN:
      case FETCH_CURRENT_USER:
        let user = action.payload
        return !isEmpty(user) ? user : null
      case LOGOUT:
        return null
    }

    return state
  },

  userProfile: (state = {}, action) => {
    if (action.type === FETCH_USER && !action.error) {
      return {user: action.payload}
    }
    return state
  },

  communityProfile: (state = {}, action) => {
    if (action.type === FETCH_COMMUNITY && !action.error) {
      return {community: action.payload}
    }
    return state
  },

  users: (state = {}, action) => {
    if (action.error) return state
    let { cache } = action.meta || {}
    if (cache && cache.hit) return state
    let user = action.payload

    switch (action.type) {
      case FETCH_USER:
        return {
          ...state,
          [user.id]: user
        }
      case FETCH_CURRENT_USER:
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
    let { cache } = action.meta || {}
    if (cache && cache.hit) return state

    switch (action.type) {
      case FETCH_COMMUNITY:
        let community = action.payload
        return {
          ...state,
          [community.slug]: community
        }
    }

    return state
  },

  posts: (state = {}, action) => {
    if (action.error) return state
    let { cache } = action.meta || {}
    if (cache && cache.hit) return state

    let { type, payload } = action
    switch (type) {
      case FETCH_POSTS:
        let posts = payload.posts.reduce((m, p) => {
          m[p.id] = p
          return m
        }, {})
        console.log(`cached ${payload.posts.length} posts`)
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
    let { cache } = action.meta || {}
    if (cache && cache.hit) return state

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
  }
})

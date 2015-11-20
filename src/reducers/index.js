import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { FETCH_COMMUNITY, FETCH_CURRENT_USER, FETCH_USER, LOGIN, LOGOUT } from '../actions'
import { isEmpty } from 'lodash'

export default combineReducers({
  routing: (state = {path: '/'}, action) => {
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

  count: (state = 0, action) => {
    if (action.type === 'INCREMENT') {
      return state + 1
    }
    return state
  },

  currentUser: (state = null, action) => {
    if (action.error) return state

    switch (action.type) {
      case LOGIN:
      case FETCH_CURRENT_USER:
        return !isEmpty(action.payload) ? action.payload : null
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

  // TODO cache users from FETCH_USER
  users: (state = {}, action) => state, // TODO

  // TODO cache communities from LOGIN, FETCH_COMMUNITY, FETCH_CURRENT_USER
  communities: (state = {}, action) => state // TODO
})

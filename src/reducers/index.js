import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { debug } from '../util/logging'
import { appendUniq } from './util'
import postsByQuery from './postsByQuery'
import { contains, uniq } from 'lodash'

import {
  FETCH_COMMUNITY,
  FETCH_CURRENT_USER,
  FETCH_POST,
  FETCH_PERSON,
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

import { FETCH_POSTS } from '../actions/fetchPosts'
import { FETCH_PEOPLE } from '../actions/fetchPeople'

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

  people: (state = {}, action) => {
    let { type, error, payload } = action
    if (error) return state

    if (type === LOGOUT) {
      let currentUser = state.current
      if (!currentUser) return state

      debug('un-caching person:', currentUser.id)
      return {
        ...state,
        current: null,
        [currentUser.id]: null
      }
    }

    if (!payload) return state

    switch (type) {
      case FETCH_PERSON:
        debug('caching person:', payload.id)
        return {
          ...state,
          [payload.id]: payload
        }
      case LOGIN:
      case FETCH_CURRENT_USER:
        debug('caching person:', payload.id)
        return {
          ...state,
          [payload.id]: payload,
          current: payload
        }
      case FETCH_PEOPLE:
        let people = payload.people.reduce((m, p) => {
          m[p.id] = p
          return m
        }, {})
        return {...state, ...people}
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
        return {...state, ...posts}
      case CREATE_POST:
      case FETCH_POST:
        return {...state, [payload.id]: payload}
    }

    return state
  },

  totalPostsByQuery: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_POSTS:
        return {...state, [meta.cache.id]: payload.posts_total}
    }
    return state
  },

  postsByQuery,

  pending: (state = {}, action) => {
    let { type } = action

    let toggle = targetType => {
      if (type === targetType) return {...state, [targetType]: false}
      if (type === targetType + '_PENDING') return {...state, [targetType]: true}
    }

    return toggle(FETCH_POSTS) ||
      toggle(FETCH_PEOPLE) ||
      state
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

  typeaheadMatches: (state = {}, action) => {
    let { error, type } = action
    if (error || !contains([TYPEAHEAD, CANCEL_TYPEAHEAD], type)) return state

    let { payload, meta: { context } } = action
    switch (type) {
      case TYPEAHEAD:
        return {...state, [context]: payload}
      case CANCEL_TYPEAHEAD:
        return {...state, [context]: []}
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
  },

  peopleByQuery: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_PEOPLE:
        let { cache } = meta
        return {
          ...state,
          [cache.id]: uniq((state[cache.id] || []).concat(payload.people.map(p => p.id)))
        }
    }
    return state
  },

  totalPeopleByQuery: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_PEOPLE:
        return {...state, [meta.cache.id]: Number(payload.people_total)}
    }
    return state
  }
})

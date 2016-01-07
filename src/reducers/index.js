import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { appendUniq } from './util'
import { contains, uniq } from 'lodash'
import people from './people'
import postEdits from './postEdits'
import postsByQuery from './postsByQuery'
import posts from './posts'
import projectsByQuery from './projectsByQuery'
import projects from './projects'
import projectEdits from './projectEdits'
import communities from './communities'
import { UPDATE_PATH } from 'redux-simple-router'

import {
  CANCEL_TYPEAHEAD,
  CREATE_COMMENT,
  CREATE_POST,
  FETCH_COMMENTS,
  FETCH_PEOPLE,
  FETCH_POSTS,
  FETCH_PROJECTS,
  LOGIN,
  LOGOUT,
  NAVIGATE,
  RESET_COMMUNITY_VALIDATION,
  SET_LOGIN_ERROR,
  SET_SIGNUP_ERROR,
  SIGNUP,
  TOGGLE_MAIN_MENU,
  TYPEAHEAD,
  UPDATE_COMMUNITY_EDITOR,
  UPDATE_POST,
  UPLOAD_IMAGE,
  VALIDATE_COMMUNITY_ATTRIBUTE,
  VALIDATE_COMMUNITY_ATTRIBUTE_PENDING
} from '../actions'

export default combineReducers({
  mainMenuOpened: (state = false, action) => {
    let { error, type } = action
    if (error) return state

    switch (type) {
      case TOGGLE_MAIN_MENU:
        return !state
      case NAVIGATE:
      case UPDATE_PATH:
        return false
    }

    return state
  },

  errors: (state = {}, action) => {
    let { error, type, payload, meta } = action
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
        return {success: true}
      case SET_LOGIN_ERROR:
        if (!payload) return {success: true}
        return {error: payload}
    }
    return state
  },

  signup: (state = {}, action) => {
    let { type, payload, error } = action
    switch (type) {
      case SIGNUP:
        if (error) return {error: payload.message}
        return {success: true}
      case SET_SIGNUP_ERROR:
        if (!payload) return {success: true}
        return {error: payload}
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

  communities,
  people,
  posts,
  postsByQuery,
  postEdits,
  projects,
  projectsByQuery,
  projectEdits,

  pending: (state = {}, action) => {
    let { type } = action

    let toggle = targetType => {
      if (type === targetType) return {...state, [targetType]: false}
      if (type === targetType + '_PENDING') return {...state, [targetType]: true}
    }

    return toggle(FETCH_POSTS) ||
      toggle(FETCH_PEOPLE) ||
      toggle(UPLOAD_IMAGE) ||
      toggle(CREATE_POST) ||
      toggle(UPDATE_POST) ||
      toggle(FETCH_PROJECTS) ||
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

    let { payload, meta: { id } } = action
    switch (type) {
      case TYPEAHEAD:
        return {...state, [id]: payload}
      case CANCEL_TYPEAHEAD:
        return {...state, [id]: []}
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
  },

  totalProjectsByQuery: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_PROJECTS:
        return {...state, [meta.cache.id]: Number(payload.projects_total)}
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
    if (error) return state

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
  }
})

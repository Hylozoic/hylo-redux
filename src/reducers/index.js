import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { contains, find } from 'lodash'
import comments from './comments'
import commentsByPost from './commentsByPost'
import people from './people'
import peopleByQuery from './peopleByQuery'
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
  CREATE_COMMUNITY,
  CREATE_POST,
  FETCH_ACTIVITY,
  FETCH_PEOPLE,
  FETCH_POSTS,
  FETCH_PROJECTS,
  LOGIN,
  LOGOUT,
  MARK_ACTIVITY_READ,
  MARK_ALL_ACTIVITIES_READ_PENDING,
  NAVIGATE,
  RESET_COMMUNITY_VALIDATION,
  SET_LOGIN_ERROR,
  SET_SIGNUP_ERROR,
  SIGNUP,
  THANK_PENDING,
  TOGGLE_MAIN_MENU,
  TYPEAHEAD,
  UPDATE_COMMUNITY_EDITOR,
  UPDATE_POST,
  UPDATE_PROJECT_INVITE,
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

  totalPostsByQuery: (state = {}, action) => {
    if (action.error) return state

    let { type, payload, meta } = action
    switch (type) {
      case FETCH_POSTS:
        return {...state, [meta.cache.id]: payload.posts_total}
    }
    return state
  },

  comments,
  commentsByPost,
  communities,
  people,
  peopleByQuery,
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
      toggle(CREATE_COMMUNITY) ||
      toggle(FETCH_ACTIVITY) ||
      state
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

  activities: (state = [], action) => {
    let { type, payload, error, meta } = action
    if (error) return state
    var activityId
    switch (type) {
      case FETCH_ACTIVITY:
        return state.concat(payload.activities)
      case MARK_ACTIVITY_READ:
        activityId = meta.activityId
        return state.map(a => a.id === activityId ? {...a, unread: false} : a)
      case MARK_ALL_ACTIVITIES_READ_PENDING:
        return state.map(a => ({...a, unread: false}))
      case THANK_PENDING:
        activityId = meta.activityId
        var updatedComment
        let activity = find(state, a => a.id === activityId)
        if (activity.comment.thanks[0]) {
          updatedComment = {...activity.comment, thanks: []}
        } else {
          updatedComment = {...activity.comment, thanks: [{}]}
        }
        return state.map(a => a.id === activityId ? {...a, comment: updatedComment} : a)
    }
    return state
  },

  totalActivities: (state = 0, action) => {
    let { type, payload, error } = action
    if (error) return state
    switch (type) {
      case FETCH_ACTIVITY:
        return payload.activities_total
    }
    return state
  }

})

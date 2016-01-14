import {
  CREATE_PROJECT,
  FETCH_PROJECT,
  FETCH_PROJECTS,
  JOIN_PROJECT,
  START_PROJECT_EDIT,
  UPDATE_PROJECT,
  UPDATE_PROJECT_EDITOR
} from './index'
import { find, pick } from 'lodash'
import { cleanAndStringify } from '../util/caching'

export function fetchProject (id) {
  return {
    type: FETCH_PROJECT,
    payload: {api: true, path: `/noo/project/${id}`},
    meta: {cache: {id, bucket: 'projects', requiredProp: 'details'}}
  }
}

export function fetchProjects (opts) {
  let { subject, id, limit, offset, type, sort, search, filter, cacheId } = opts
  if (!offset) offset = 0
  let payload = {api: true}
  let query = {offset, limit, type, sort, search, filter}

  switch (subject) {
    case 'all':
      payload.path = '/noo/project'
      break
    case 'community':
      payload.path = '/noo/project'
      query.communityId = id
      break
  }

  payload.path += '?' + cleanAndStringify(query)

  let cache = {id: cacheId, bucket: 'projectsByQuery', limit, offset, array: true}
  return {type: FETCH_PROJECTS, payload, meta: {cache}}
}

export function startProjectEdit (id) {
  return {
    type: START_PROJECT_EDIT,
    meta: {id}
  }
}

export function updateProjectEditor (id, payload) {
  return {
    type: UPDATE_PROJECT_EDITOR,
    payload,
    meta: {id}
  }
}

// transform params to match the expectations of the API
const shim = params => {
  let shimmed = pick(params, 'title', 'intention', 'details', 'location', 'visibility', 'publish', 'unpublish')

  ;['video', 'image'].forEach(type => {
    let obj = find(params.media, m => m.type === type)
    if (obj) shimmed[`${type}_url`] = obj.url
  })

  if (params.community) shimmed.community_id = params.community.id
  return shimmed
}

export function updateProject (id, params) {
  // note that meta.params is the non-shimmed version, so updating the
  // project in the store is a simple merge in almost all cases
  // (see the projects reducer for an exception)
  return {
    type: UPDATE_PROJECT,
    payload: {api: true, params: shim(params), path: `/noo/project/${id}`, method: 'POST'},
    meta: {id, params}
  }
}

export function createProject (id, params) {
  return {
    type: CREATE_PROJECT,
    payload: {api: true, params: shim(params), path: `/noo/project`, method: 'POST'},
    meta: {id}
  }
}

export function joinProject (project, currentUser) {
  return {
    type: JOIN_PROJECT,
    payload: {api: true, path: `/noo/project/${project.id}/join`, method: 'POST'},
    meta: {id: project.id, prevProps: project, currentUser}
  }
}

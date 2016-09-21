import { cloneDeep, pick } from 'lodash'
import { get } from 'lodash/fp'
import qs from 'querystring'
import { cleanAndStringify } from '../util/caching'
import {
  CANCEL_POST_EDIT,
  CHANGE_EVENT_RESPONSE,
  COMPLETE_POST,
  CREATE_POST,
  FETCH_LINK_PREVIEW,
  FETCH_POST,
  FOLLOW_POST,
  PIN_POST,
  REMOVE_DOC,
  REMOVE_IMAGE,
  REMOVE_POST,
  START_POST_EDIT,
  UPDATE_POST,
  UPDATE_POST_EDITOR,
  VOTE_ON_POST
} from './index'

// id refers to the id of the editing context, e.g. 'new-event'
export function createPost (id, params) {
  return {
    type: CREATE_POST,
    payload: {api: true, params, path: '/noo/post', method: 'POST'},
    meta: {id}
  }
}

export function fetchPost (id) {
  let querystring = cleanAndStringify({comments: 1, votes: 1, children: 1})

  return {
    type: FETCH_POST,
    payload: {api: true, path: `/noo/post/${id}?${querystring}`},
    meta: {
      cache: {id, bucket: 'posts', requiredProp: 'children'},
      addDataToStore: {
        communities: get('communities'),
        people: get('people')
      }
    }
  }
}

export function startPostEdit (post) {
  let fields = [
    'id', 'name', 'type', 'description', 'location', 'community_ids', 'public',
    'media', 'start_time', 'end_time', 'tag', 'children', 'linkPreview'
  ]
  let payload = cloneDeep(pick(post, fields))
  return {type: START_POST_EDIT, payload}
}

export function cancelPostEdit (id) {
  return {type: CANCEL_POST_EDIT, meta: {id}}
}

export function updatePostEditor (payload, id) {
  return {
    type: UPDATE_POST_EDITOR,
    payload,
    meta: {id}
  }
}

export function updatePost (id, params) {
  return {
    type: UPDATE_POST,
    payload: {api: true, params, path: `/noo/post/${id}`, method: 'POST'},
    meta: {id, params}
  }
}

export function removeImage (subject, id) {
  return {
    type: REMOVE_IMAGE,
    meta: {subject, id}
  }
}

export function removeDoc (payload, id) {
  return {
    type: REMOVE_DOC,
    payload,
    meta: {id}
  }
}

export function changeEventResponse (id, response, user) {
  return {
    type: CHANGE_EVENT_RESPONSE,
    payload: {api: true, params: {response}, path: `/noo/post/${id}/rsvp`, method: 'POST'},
    meta: {id, response, user}
  }
}

export function voteOnPost (post, person) {
  return {
    type: VOTE_ON_POST,
    payload: {api: true, path: `/noo/post/${post.id}/vote`, method: 'POST'},
    meta: {id: post.id, personId: person.id, optimistic: true}
  }
}

export function followPost (id, person) {
  return {
    type: FOLLOW_POST,
    payload: {api: true, path: `/noo/post/${id}/follow`, method: 'POST'},
    meta: {id, personId: person.id, optimistic: true}
  }
}

export function removePost (id) {
  return {
    type: REMOVE_POST,
    payload: {api: true, path: `/noo/post/${id}`, method: 'DELETE'},
    meta: {id}
  }
}

export function pinPost (slug, id) {
  return {
    type: PIN_POST,
    payload: {api: true, path: `/noo/community/${slug}/post/${id}/pin`, method: 'POST'},
    meta: {slug, id}
  }
}

export function fetchLinkPreview (url) {
  const q = qs.stringify({url})
  return {
    type: FETCH_LINK_PREVIEW,
    payload: {api: true, path: `/noo/link-preview?${q}`}
  }
}

export function completePost (id) {
  return {
    type: COMPLETE_POST,
    payload: {api: true, path: `/noo/post/${id}/fulfill`, method: 'POST'},
    meta: {optimistic: true, id}
  }
}

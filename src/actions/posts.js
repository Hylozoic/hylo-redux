import { cloneDeep, pick, map } from 'lodash'
import { get } from 'lodash/fp'
import qs from 'querystring'
import { cleanAndStringify, createCacheId } from '../util/caching'
import { tagsInText } from '../models/hashtag'
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
  UNFOLLOW_POST,
  UPDATE_POST,
  UPDATE_POST_EDITOR,
  UPDATE_POST_READ_TIME,
  VOTE_ON_POST,
  FETCH_POSTS,
  CHECK_FRESHNESS_POSTS
} from './constants'

// id refers to the id of the editing context, e.g. 'new-event'
export function createPost (id, params, slug) {
  return {
    type: CREATE_POST,
    payload: {api: true, params, path: '/noo/post', method: 'POST'},
    meta: {
      id,
      tags: tagsInText(params.description),
      createdTags: params.tagDescriptions,
      optimistic: true,
      slug,
      timeout: 15000
    }
  }
}

export function fetchPost (id, opts = {}) {
  let querystring = opts.minimal ? ''
    : cleanAndStringify({comments: 1, votes: 1, children: 1})

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
    'media', 'starts_at', 'ends_at', 'tag', 'children', 'linkPreview'
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

export function updatePost (id, params, slug) {
  return {
    type: UPDATE_POST,
    payload: {api: true, params, path: `/noo/post/${id}`, method: 'POST'},
    meta: {id, params, optimistic: true, slug, timeout: 15000}
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

export function unfollowPost (id, personId) {
  return {
    type: UNFOLLOW_POST,
    payload: {api: true, path: `/noo/post/${id}/follow`, method: 'DELETE'},
    meta: {id, personId, optimistic: true}
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

export function completePost (id, contributors = []) {
  return {
    type: COMPLETE_POST,
    payload: {
      api: true,
      path: `/noo/post/${id}/fulfill`,
      method: 'POST',
      params: {
        contributorIds: map(contributors, 'id')
      }
    },
    meta: {optimistic: true, contributors, id}
  }
}

export function updatePostReadTime (id) {
  return {
    type: UPDATE_POST_READ_TIME,
    payload: {api: true, path: `/noo/post/${id}/update-last-read`, method: 'POST'},
    meta: {id}
  }
}

export function fetchPosts (opts) {
  const {
    subject, id, limit, type, tag, sort, search, filter, cacheId, omit
  } = opts
  const offset = opts.offset || 0
  const queryParams = {
    offset, limit, type, tag, sort, search, filter, omit, // eslint-disable-line object-property-newline
    comments: true,
    votes: true
  }
  let path

  switch (subject) {
    case 'threads':
      path = '/noo/threads'
      Object.assign(queryParams, {votes: false, reads: true})
      break
    case 'community':
      if (id === 'all' && tag) {
        path = `/noo/tag/${tag}/posts`
        queryParams.tag = null
      } else {
        path = `/noo/community/${id}/posts`
      }
      break
    case 'person':
      path = `/noo/user/${id}/posts`
      if (opts['check-join-requests']) {
        queryParams['check-join-requests'] = 1
      }
      break
    case 'all-posts':
      path = `/noo/user/${id}/all-community-posts`
      break
    case 'followed-posts':
      path = `/noo/user/${id}/followed-posts`
      break
    case 'post':
      path = `/noo/post/${id}/posts`
      break
    case 'project':
    case 'network':
      path = `/noo/${subject}/${id}/posts`
      break
  }
  path += '?' + cleanAndStringify(queryParams)

  return {
    type: FETCH_POSTS,
    payload: {api: true, path},
    meta: {
      cache: {id: cacheId, bucket: 'postsByQuery', limit, offset, array: true},
      addDataToStore: {
        people: get('people'),
        communities: get('communities')
      }
    }
  }
}

export function checkFreshness (subject, id, posts, query = {}) {
  const { limit, type, sort, search, filter, tag, omit } = query
  const offset = query.offset || 0
  const queryParams = {offset, limit, type, sort, search, filter, tag, omit}

  let path
  if (subject === 'community' && id === 'all' && tag) {
    path = `/noo/freshness/posts/tag/${tag}`
    queryParams.tag = null
  } else {
    path = `/noo/freshness/posts/${subject}/${id}`
  }
  path += '?' + cleanAndStringify(queryParams)

  return {
    type: CHECK_FRESHNESS_POSTS,
    payload: {api: true, params: {posts}, path, method: 'POST'},
    meta: {cacheId: createCacheId(subject, id, query)}
  }
}

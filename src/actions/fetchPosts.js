import { cleanAndStringify, createCacheId } from '../util/caching'
import { FETCH_POSTS, CHECK_FRESHNESS_POSTS } from './index'
import { get } from 'lodash/fp'

export function fetchPosts (opts) {
  // communityId is only used when fetching a tag
  const {
    subject, id, limit, type, tag, sort, search, filter, cacheId, omit
  } = opts
  const offset = opts.offset || 0
  const queryParams = {
    offset, limit, type, tag, sort, search, filter, omit,
    comments: true, votes: true}
  let path

  switch (subject) {
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
      break
    case 'all-posts':
      path = `/noo/user/${id}/all-community-posts`
      break
    case 'followed-posts':
      path = `/noo/user/${id}/followed-posts`
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

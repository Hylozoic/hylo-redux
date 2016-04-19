import { cleanAndStringify, createCacheId } from '../util/caching'
import { FETCH_POSTS, CHECK_FRESHNESS_POSTS } from './index'

export function fetchPosts (opts) {
  // communityId is only used when fetching a tag
  let { subject, id, limit, offset, type, sort, search, filter, cacheId, communityId } = opts
  if (!offset) offset = 0
  const querystring = cleanAndStringify({
    offset,
    limit,
    type,
    sort,
    search,
    filter,
    comments: true,
    votes: true})
  let path

  switch (subject) {
    case 'community':
      path = `/noo/community/${id}/posts`
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
      path = `/noo/project/${id}/posts`
      break
    case 'network':
      path = `/noo/network/${id}/posts`
      break
    case 'tag':
      path = communityId
        ? `/noo/community/${communityId}/tag/${id}/posts`
        : `/noo/tag/${id}/posts`
      break
  }
  path += '?' + querystring

  return {
    type: FETCH_POSTS,
    payload: {api: true, path},
    meta: {
      cache: {id: cacheId, bucket: 'postsByQuery', limit, offset, array: true}
    }
  }
}

export function checkFreshness (subject, id, posts, query = {}) {
  let { limit, offset, type, sort, search, filter, communityId } = query
  let cacheId = createCacheId(subject, id, query)
  if (!offset) offset = 0
  let querystring = cleanAndStringify({offset, limit, type, sort, search, filter})
  let payload = {api: true, params: {posts}, path: `/noo/freshness/posts/${subject}/${id}`, method: 'POST'}

  if (subject === 'tag') {
    payload.path = communityId
      ? `/noo/freshness/posts/community/${communityId}/tag/${id}`
      : `/noo/freshness/posts/tag/${id}`
  }

  payload.path += '?' + querystring

  var meta = {cacheId}

  return {type: CHECK_FRESHNESS_POSTS, payload, meta}
}

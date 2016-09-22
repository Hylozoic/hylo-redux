import { cleanAndStringify, createCacheId } from '../util/caching'
import {
  FETCH_LEFT_NAV_TAGS,
  FETCH_TAGS,
  FOLLOW_TAG,
  REMOVE_TAG,
  CREATE_TAG_IN_COMMUNITY,
  SHOW_ALL_TAGS,
  SHOW_SHARE_TAG,
  UPDATE_COMMUNITY_TAG
} from './index'

export function followTag (id, tagName) {
  return {
    type: FOLLOW_TAG,
    payload: {api: true, path: `/noo/community/${id}/tag/${tagName}/follow`, method: 'POST'},
    meta: {id, tagName}
  }
}

export function fetchTags (opts) {
  const { subject, id, limit } = opts
  const offset = opts.offset || 0
  const cacheId = createCacheId(subject, id)

  var path
  if (subject === 'community') {
    path = `/noo/community/${id}/tags`
  }
  path += '?' + cleanAndStringify({limit, offset})

  return {
    type: FETCH_TAGS,
    payload: {api: true, path},
    meta: {
      cache: {id: cacheId, bucket: 'tagsByQuery', limit, offset, array: true}
    }
  }
}

export function removeTagFromCommunity (tag, slug) {
  const { id, name } = tag
  return {
    type: REMOVE_TAG,
    payload: {api: true, path: `/noo/community/${slug}/tag/${id}`, method: 'DELETE'},
    meta: {id, name, slug}
  }
}

export function createTagInCommunity (params, slug) {
  return {
    type: CREATE_TAG_IN_COMMUNITY,
    payload: {api: true, params, path: `/noo/community/${slug}/tag/`, method: 'POST'},
    meta: {slug, optimistic: true}
  }
}

export function showAllTags (slug) {
  return {
    type: SHOW_ALL_TAGS
  }
}

export function showShareTag (tagName, slug) {
  return {type: SHOW_SHARE_TAG, payload: {tagName, slug}}
}

export function fetchLeftNavTags (id, refresh) {
  return {
    type: FETCH_LEFT_NAV_TAGS,
    payload: {api: true, path: `/noo/community/${id}/tags/followed`},
    meta: {id, cache: {id, bucket: 'tagsByCommunity', refresh}}
  }
}

export function updateCommunityTag (tag, community, params) {
  const { id, name } = tag
  const { slug } = community
  return {
    type: UPDATE_COMMUNITY_TAG,
    payload: {api: true, path: `/noo/community/${slug}/tag/${id}`, params, method: 'POST'},
    meta: {
      name, params, optimistic: true,
      slug, communityId: community.id
    }
  }
}

import { makeUrl } from './util/navigation'
import config from './config'

export const origin = () =>
  typeof window !== 'undefined' ? window.location.origin : config.host

export const communityUrl = (community, params) =>
  makeUrl(`/c/${community.slug}`, params)

export const communitySettingsUrl = (community, params) =>
  makeUrl(`/c/${community.slug}/settings`, params)

export const communityJoinRequestsUrl = (community, params) =>
  makeUrl(`/c/${community.slug}/invite#join_requests`, params)

export const inviteSettingsUrl = community =>
  makeUrl(`/c/${community.slug}/invite`)

export const networkUrl = network =>
  `/n/${network.slug}`

export const communityJoinUrl = community =>
  `${origin()}/c/${community.slug}/join/${community.beta_access_code}`

export const communityTagJoinUrl = (community, tagName) =>
  `${origin()}/c/${community.slug}/join/${community.beta_access_code}/tag/${tagName}`

export const commentUrl = comment =>
  `/p/${comment.post_id}#comment-${comment.id}`

export const postUrl = (postId, commentId) =>
  `/p/${postId}` + (commentId ? `#comment-${commentId}` : '')

export const threadUrl = (threadId) =>
  `/t/${threadId}`

export const userUrl = (user) =>
  `/u/${user.id}`

export const tagUrl = (name, slug) => {
  var result = ''
  if (slug) result += `/c/${slug}`
  if (name !== 'all-topics') result += `/tag/${name}`
  return result
}

export const tagUrlComponents = url => {
  let match = url.match(/(?:\/c\/([^\/]+))?\/tag\/([^\/]+)/)
  if (!match) return {}
  return {
    slug: match[1],
    tagName: match[2]
  }
}

export const userIdFromUrl = url => {
  let match = (url || '').match(/\/u\/([^\/]+)/)
  if (!match) return null
  return match[1]
}

export const isCommunityUrl = (path) =>
  path.match(/\/c\/[^/]+$/)

export const isSearchUrl = (path) =>
  path.split('?')[0] === '/search'

export const peopleUrl = (community, search) =>
  `${community ? '/c/' + community.slug : ''}/people${search ? `?search=${search}` : ''}`

export const checklistUrl = community =>
  `/c/${community.slug}?checklist=true`

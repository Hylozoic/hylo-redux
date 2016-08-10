import { MemberRole } from './community'
import { curry, find, get, maxBy, some } from 'lodash'
import { same, truthy } from './index'

// this works if community is an object with an id, or just an id
export const membership = (currentUser, community) =>
  community && find(get(currentUser, 'memberships'), m =>
      m.community.id === (community.id || community))

export const getCommunity = (currentUser, community) =>
  get(membership(currentUser, community), 'community')

export const isMember = truthy(membership)

export const canModerate = curry((currentUser, community) =>
  get(membership(currentUser, community), 'role') === MemberRole.MODERATOR ||
    isAdmin(currentUser))

export const canInvite = (currentUser, community) =>
  canModerate(currentUser, community) ||
  (isMember(currentUser, community) && get(community, 'settings.all_can_invite'))

export const isAdmin = currentUser => !!get(currentUser, 'is_admin')

export const canEditPost = (currentUser, post) => {
  return same('id', currentUser, post.user) ||
    some(post.communities.map(c => c.id ? c.id : c), canModerate(currentUser)) ||
    isAdmin(currentUser)
}

export const canEditComment = (currentUser, comment, community) =>
  canModerate(currentUser, community) || same('id', currentUser, comment.user)

export const newestMembership = currentUser =>
  maxBy(get(currentUser, 'memberships'), 'created_at')

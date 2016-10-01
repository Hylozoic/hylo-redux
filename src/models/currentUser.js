import { getCommunity, MemberRole } from './community'
import { curry, find, maxBy, partialRight, some } from 'lodash'
import { get, map } from 'lodash/fp'
import { same, truthy } from './index'
import { featureFlags } from '../config'

// this works if community is an object with an id, or just an id
export const membership = (currentUser, community) =>
  community && find(get('memberships', currentUser), m =>
    m.community_id === (community.id || community) ||
    get('community.slug', m) === (community.slug || community))

export const isMember = truthy(membership)

export const canModerate = curry((currentUser, community) =>
  get('role', membership(currentUser, community)) === MemberRole.MODERATOR ||
    isAdmin(currentUser))

export const canInvite = (currentUser, community) =>
  canModerate(currentUser, community) ||
  (isMember(currentUser, community) && get('settings.all_can_invite', community))

export const isAdmin = truthy(get('is_admin'))

export const isTester = partialRight(isMember, {id: 39, slug: 'hylo'})

export const canEditPost = (currentUser, post) => {
  return same('id', currentUser, post.user) ||
    some(post.communities.map(c => c.id ? c.id : c), canModerate(currentUser)) ||
    isAdmin(currentUser)
}

export const canEditComment = (currentUser, comment, community) =>
  canModerate(currentUser, community) || same('id', currentUser, comment.user)

export const newestMembership = currentUser =>
  maxBy(get('memberships', currentUser), 'created_at')

export const hasFeature = (currentUser, key) => {
  const flag = featureFlags()[key]
  return flag === 'on' || isTester(currentUser) && flag === 'testing'
}

export const denormalizedCurrentUser = state => {
  const user = state.people.current
  if (!user) return
  return {
    ...user,
    memberships: map(membership => {
      return ({
        ...membership,
        community: getCommunity(membership.community_id, state)
      })
    }, user.memberships)
  }
}

export const isLoggedIn = state => !!state.people.current

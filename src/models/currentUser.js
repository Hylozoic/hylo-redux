import { getCommunity, MemberRole } from './community'
import { curry, find, includes, intersection, isEmpty, maxBy, some } from 'lodash'
import { eq, flow, get, map } from 'lodash/fp'
import { same, truthy } from './index'
import { featureFlags } from '../config'
import { groupUser } from 'hylo-utils'

export const hasBio = (currentUser) => currentUser.bio && currentUser.bio.length > 0

export const hasSkills = (currentUser) => currentUser.tags && currentUser.tags.length > 0

// this works if community is an object with an id, or just an id
export const membership = curry((currentUser, community) =>
  community && find(get('memberships', currentUser), m =>
    m.community_id === (community.id || community) ||
    get('community.slug', m) === (community.slug || community)))

export const isMember = truthy(membership)

export const isModerator = curry((currentUser, community) =>
  flow(
    membership(currentUser), get('role'), eq(MemberRole.MODERATOR)
  )(community))

export const canModerate = curry((currentUser, community) =>
  !!community && (isModerator(currentUser, community) || isAdmin(currentUser)))

export const canInvite = (currentUser, community) =>
  canModerate(currentUser, community) ||
  (isMember(currentUser, community) && get('settings.all_can_invite', community))

export const isAdmin = truthy(get('is_admin'))

export const isTester = user =>
  some([
    {id: '29', slug: 'hylo'},
    {id: '1972', slug: 'testmetalab'}
  ], membership(user))

export const canEditPost = (currentUser, permissionsPost) => {
  return permissionsPost && (same('id', currentUser, permissionsPost.user) ||
    some(permissionsPost.communities.map(c => c.id ? c.id : c), canModerate(currentUser)) ||
    isAdmin(currentUser))
}

export const canCommentOnPost = (currentUser, permissionsPost) => {
  return currentUser && permissionsPost && (includes(permissionsPost.follower_ids, currentUser.id) ||
    !isEmpty(intersection(
      map('community_id', get('memberships', currentUser)),
      permissionsPost.community_ids)))
}

export const canEditComment = (currentUser, comment, community) =>
  canModerate(currentUser, community) || same('id', currentUser, comment.user)

export const newestMembership = currentUser =>
  maxBy(get('memberships', currentUser), 'created_at')

export const hasFeature = (currentUser, key) => {
  if (!key) throw new Error("Can't call hasFeature without a key")
  const flag = featureFlags()[key]
  switch (flag) {
    case 'on':
      return true
    case 'testing':
      return isTester(currentUser)
    case 'ab':
      return currentUser ? groupUser(currentUser.id, key) === 0 : false
    default:
      return false
  }
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

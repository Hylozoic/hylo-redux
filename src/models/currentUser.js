import { MemberRole } from './community'
import { find, get } from 'lodash'

const truthy = fn => (...args) => !!fn(...args)

export const membership = (currentUser, community) =>
  find(get(currentUser, 'memberships'), m => m.community.id === community.id)

export const isMember = truthy(membership)

export const canModerate = (currentUser, community) =>
  get(membership(currentUser, community), 'role') === MemberRole.MODERATOR

export const canInvite = (currentUser, community) =>
  canModerate(currentUser, community) ||
  (isMember(currentUser, community) && get(community, 'settings.all_can_invite'))

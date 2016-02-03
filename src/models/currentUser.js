import { MemberRole } from './community'
import { get } from 'lodash'

export function canModerate (currentUser, community) {
  let membership = currentUser.memberships.find(m => m.community.id === community.id)
  return get(membership, 'role') === MemberRole.MODERATOR
}

export function canInvite (currentUser, community) {
  return community.settings.all_can_invite || canModerate(currentUser, community)
}

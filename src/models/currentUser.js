import { MemberRole } from './community'
import { find, get, includes } from 'lodash'
import qs from 'querystring'

const truthy = fn => (...args) => !!fn(...args)

export const membership = (currentUser, community) =>
  community &&
    find(get(currentUser, 'memberships'), m => m.community.id === community.id)

export const isMember = truthy(membership)

export const canModerate = (currentUser, community) =>
  get(membership(currentUser, community), 'role') === MemberRole.MODERATOR

export const canInvite = (currentUser, community) =>
  canModerate(currentUser, community) ||
  (isMember(currentUser, community) && get(community, 'settings.all_can_invite'))

export const isProjectOwner = (currentUser, project) =>
  currentUser.id === project.id

// FIXME how to do this without depending on state?
export const isProjectModerator = (currentUser, project, state) => {
  if (!project) return false
  let key = qs.stringify({subject: 'project-moderators', id: project.id})
  return includes(get(state, `peopleByQuery.${key}`), get(currentUser, 'id'))
}

export const canModerateProject = (currentUser, project, state) =>
  project && (canModerate(currentUser, {id: project.community_id}) ||
  isProjectModerator(currentUser, project) ||
  project.user.id === get(currentUser, 'id'))

export const isAdmin = currentUser => !!get(currentUser, 'is_admin')

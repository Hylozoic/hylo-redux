import { values } from 'lodash'
import { find, get, pickBy } from 'lodash/fp'
import { showModal } from '../actions'

export const MemberRole = {DEFAULT: 0, MODERATOR: 1}
export const defaultBanner = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_banner.jpg'
export const defaultAvatar = 'https://d3ngex8q79bk55.cloudfront.net/misc/default_community_avatar.png'

export const avatarUploadSettings = ({ id, slug }) => ({
  id: slug,
  subject: 'community-avatar',
  path: `community/${id}/avatar`,
  convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
})

export const bannerUploadSettings = ({ id, slug }) => ({
  id: slug,
  subject: 'community-banner',
  path: `community/${id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})

export const getCommunity = (idOrSlug, state) => {
  const ret = state.communities[idOrSlug] || find(c => c.id === idOrSlug, state.communities)
  return ret
}

export const getCurrentCommunity = state =>
  state.currentCommunityId ? getCommunity(state.currentCommunityId, state) : null

export const getLastCommunity = state => {
  const lastCommunityId = get('people.current.settings.currentCommunityId', state)
  return lastCommunityId ? getCommunity(lastCommunityId, state) : null
}

export const getCurrentOrLastCommunity = state =>
  state.currentCommunityId ? getCurrentCommunity(state) : getLastCommunity(state)

export const getFollowedTags = ({ slug }, state) =>
  values(pickBy('followed', state.tagsByCommunity[slug]))

export const getChecklist = community => {
  const { settings } = community
  const { checklist } = settings || {}
  return [
    {title: 'Add a logo', action: showModal('add-logo'), done: !!get('logo', checklist)},
    {title: 'Add a banner', action: showModal('add-logo'), done: !!get('banner', checklist)},
    {title: 'Invite members', action: showModal('invite'), done: !!get('invite', checklist)},
    {title: 'Add a topic', action: showModal('tag-editor', {creating: true}), done: !!get('topics', checklist)},
    {title: 'Start your first conversation', action: showModal('post-editor'), done: !!get('post', checklist)}
  ]
}

export const defaultInvitationSubject = name =>
  `Join ${name} on Hylo`

export const defaultInvitationMessage = name =>
  `${name} is using Hylo, a new kind of social network that's designed to help communities and organizations create things together.\n\n` +
  "We're surrounded by incredible people, skills, and resources. But it can be hard to know whom to connect with, for what, and when. Often the things we need most are closer than we think.\n\n" +
  'Hylo makes it easy to discover the abundant skills, resources, and opportunities in your communities that might otherwise go unnoticed. Together, we can create whatever we can imagine.'

export const categories = {
  'coworking': 'Co-working space',
  'makerspace': 'Maker space',
  'startupAccelerator': 'Startup accelerator',
  'communityCenter': 'Community center',
  'localAffinityNetwork': 'Local affinity network',
  'distributedAffinityNetwork': 'Distributed affinity network',
  'event': 'Special event',
  'neighborhood': 'Neighborhood',
  'alumniCommunity': 'Alumni community',
  'organization': 'Organization',
  'other': 'Other'
}

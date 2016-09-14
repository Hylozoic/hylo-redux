import { values } from 'lodash'
import { find, pickBy, get, includes } from 'lodash/fp'

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

export const getCommunity = (idOrSlug, state) =>
  state.communities[idOrSlug] || find(c => c.id === idOrSlug, state.communities)

export const getCurrentCommunity = state =>
  getCommunity(state.currentCommunityId, state)

export const getLastCommunity = state =>
  getCommunity(get('people.current.settings.currentCommunityId', state), state)

export const getCurrentOrLastCommunity = state =>
  state.currentCommunityId ? getCurrentCommunity(state) : getLastCommunity(state)

export const getFollowedTags = ({ slug }, state) =>
  values(pickBy('followed', state.tagsByCommunity[slug]))

export const getCheckList = community => {
  const checkedItems = get('checkedItems', community)
  const slug = get('slug', community)
  return [
    {title: 'Invite Members', link: `/c/${slug}/invite`, id: 1, done: includes('invite', checkedItems)},
    {title: 'Setup topics and skills', link: `/c/${slug}/invite`, id: 2, done: includes('topics', checkedItems)},
    {title: 'Add about info', link: `/c/${slug}/settings`, id: 3, done: includes('about', checkedItems)},
    {title: 'Make your first post', link: `/c/${slug}`, id: 4, done: includes('post', checkedItems)}
  ]
}

export const defaultInvitationSubject = name =>
  `Join ${name} on Hylo`

export const defaultInvitationMessage = name =>
  `${name} is using Hylo, a new kind of social network that's designed to help communities and organizations create things together.\n\n` +
  "We're surrounded by incredible people, skills, and resources. But it can be hard to know whom to connect with, for what, and when. Often the things we need most are closer than we think.\n\n" +
  'Hylo makes it easy to discover the abundant skills, resources, and opportunities in your communities that might otherwise go unnoticed. Together, we can create whatever we can imagine.'

import { find } from 'lodash'

export const MemberRole = {DEFAULT: 0, MODERATOR: 1}

export const avatarUploadSettings = community => ({
  id: community.slug,
  subject: 'community-avatar',
  path: `community/${community.id}/avatar`,
  convert: {width: 160, height: 160, fit: 'crop', rotate: 'exif'}
})

export const bannerUploadSettings = community => ({
  id: community.slug,
  subject: 'community-banner',
  path: `community/${community.id}/banner`,
  convert: {width: 1600, format: 'jpg', fit: 'max', rotate: 'exif'}
})

export const getCommunity = (state, idOrSlug) =>
  state.communities[idOrSlug] || find(state.communities, c => c.id === idOrSlug)

export const getCurrentCommunity = state =>
  getCommunity(state, state.currentCommunityId)

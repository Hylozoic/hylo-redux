import {
  CREATE_COMMENT,
  CREATE_COMMUNITY,
  CREATE_NETWORK,
  CREATE_POST,
  FETCH_ACTIVITY,
  FETCH_COMMUNITIES,
  FETCH_INVITATIONS,
  FETCH_PEOPLE,
  FETCH_POSTS,
  FETCH_TAGS,
  SEARCH,
  SEND_COMMUNITY_INVITATION,
  SEND_COMMUNITY_TAG_INVITATION,
  UPDATE_POST,
  UPLOAD_IMAGE
} from '../actions'

export default function pending (state = {}, action) {
  const { type, meta } = action

  const toggle = (targetType, useMeta) => {
    if (type === targetType) return {...state, [targetType]: false}
    if (type === targetType + '_PENDING') {
      return {...state, [targetType]: (useMeta && meta ? meta : true)}
    }
  }

  return toggle(FETCH_POSTS) ||
    toggle(FETCH_PEOPLE) ||
    toggle(UPLOAD_IMAGE, true) ||
    toggle(CREATE_POST) ||
    toggle(UPDATE_POST) ||
    toggle(CREATE_COMMUNITY) ||
    toggle(CREATE_NETWORK) ||
    toggle(FETCH_ACTIVITY) ||
    toggle(SEND_COMMUNITY_INVITATION) ||
    toggle(SEND_COMMUNITY_TAG_INVITATION) ||
    toggle(FETCH_INVITATIONS) ||
    toggle(FETCH_COMMUNITIES) ||
    toggle(FETCH_TAGS) ||
    toggle(SEARCH) ||
    toggle(CREATE_COMMENT) ||
    state
}

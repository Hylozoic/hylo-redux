import { get, partial } from 'lodash'
import { mostRecentCommunity } from '../models/person'

// These strings were not used prior to hylo-redux
export const ADDED_COMMUNITY = 'Add community'
export const EDITED_USER_SETTINGS = 'Edit user settings'
export const INVITED_COMMUNITY_MEMBERS = 'Invited community members'

// These strings correspond to the names of events in Mixpanel with historical
// data, so they should be changed with care
export const ADDED_COMMENT = 'Post: Comment: Add'
export const ADDED_POST = 'Add Post'
export const CLICKTHROUGH = 'Clickthrough'
export const EDITED_POST = 'Edit Post'
export const LOGGED_IN = 'Login success'
export const SIGNED_UP = 'Signup success'
export const SHOWED_POST_COMMENTS = 'Post: Comments: Show'
export const STARTED_LOGIN = 'Login start'
export const STARTED_SIGNUP = 'Signup start'
export const VIEWED_COMMUNITY = 'Community: Load Community'
export const VIEWED_NOTIFICATIONS = 'Notifications: View'
export const VIEWED_PERSON = 'Member Profiles: Loaded a profile'
export const VIEWED_SELF = 'Member Profiles: Loaded Own Profile'

export function trackEvent (eventName, options = {}) {
  const { person, post, tag, community, ...otherOptions } = options
  const track = partial(window.analytics.track, eventName)
  switch (eventName) {
    case ADDED_COMMUNITY:
    case VIEWED_COMMUNITY:
    case INVITED_COMMUNITY_MEMBERS:
      track({community: community.name})
      break
    case VIEWED_PERSON:
      let { id, name } = person
      track({id, name})
      break
    case ADDED_COMMENT:
    case SHOWED_POST_COMMENTS:
      track({post_id: post.id})
      break
    case ADDED_POST:
    case EDITED_POST:
      track({post_tag: tag, community: community.name})
      break
    case CLICKTHROUGH:
      track({community, ...otherOptions})
      break
    case EDITED_USER_SETTINGS:
    case LOGGED_IN:
    case SIGNED_UP:
    case STARTED_LOGIN:
    case STARTED_SIGNUP:
    case VIEWED_NOTIFICATIONS:
    case VIEWED_SELF:
      track()
      break
    default:
      const message = `Don't know how to handle event named "${eventName}"`
      window.alert(message)
      throw new Error(message)
  }

  return Promise.resolve()
}

export const identify = person => {
  if (!person) return

  let { id, name, email, post_count, created_at } = person
  let community = mostRecentCommunity(person)
  let account = person.linkedAccounts[0]

  window.analytics.identify(id, {
    email, name, post_count, createdAt: created_at,
    provider: get(account, 'provider_key'),
    community: get(community, 'name')
  })
}

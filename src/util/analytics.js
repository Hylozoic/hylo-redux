import { partial } from 'lodash'
import { get } from 'lodash/fp'
import { mostRecentCommunity } from '../models/person'
import moment from 'moment-timezone'

// These strings were not used prior to hylo-redux
export const ADDED_BIO = 'Add bio'
export const ADDED_SKILL = 'Add skill'
export const ADDED_COMMUNITY = 'Add community'
export const EDITED_USER_SETTINGS = 'Edit user settings'
export const FOLLOWED_TOPIC = 'Follow topic'
export const LOGIN_ATTEMPTED = 'Login attempt'
export const LOGIN_FAILED = 'Login failure'
export const INVITED_COMMUNITY_MEMBERS = 'Invited community members'
export const NAVIGATED_FROM_PUSH_NOTIFICATION = 'Navigate from push notification'
export const OPENED_MOBILE_APP = 'Open mobile app'
export const OPENED_POST_EDITOR = 'Open post editor'
export const SEARCHED = 'Search'
export const STARTED_MESSAGE = 'Messages: Start a message'
export const SENT_MESSAGE = 'Messages: Send a message'
export const VIEWED_MESSAGE_THREAD = 'Messages: View a thread'
export const VIEWED_MESSAGE_THREAD_LIST = 'Messages: View list of threads'

// These strings correspond to the names of events in Mixpanel with historical
// data, so they should be changed with care
export const ADDED_COMMENT = 'Post: Comment: Add'
export const ADDED_POST = 'Add Post'
export const CLICKTHROUGH = 'Clickthrough'
export const EDITED_POST = 'Edit Post'
export const LOGGED_IN = 'Login success'
export const SHOWED_POST_COMMENTS = 'Post: Comments: Show'
export const STARTED_LOGIN = 'Login start'
export const STARTED_SIGNUP = 'Signup start'
export const VIEWED_COMMUNITY = 'Community: Load Community'
export const VIEWED_NOTIFICATIONS = 'Notifications: View'
export const VIEWED_PERSON = 'Member Profiles: Loaded a profile'
export const VIEWED_SELF = 'Member Profiles: Loaded Own Profile'

export function trackEvent (eventName, props = {}) {
  const track = partial(window.analytics.track, eventName)
  const { person, post, community, ...otherProps } = props

  switch (eventName) {
    case VIEWED_PERSON:
      let { id, name } = person
      track({id, name, ...otherProps})
      break
    case ADDED_COMMENT:
    case SHOWED_POST_COMMENTS:
      track({post_id: post.id, ...otherProps})
      break
    case CLICKTHROUGH:
      track({community, ...otherProps})
      break
    default:
      track({community: get('name', community), ...otherProps})
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
    provider: get('provider_key', account),
    community: get('name', community),
    'Signup Week': moment.tz(created_at, 'UTC').startOf('week').toISOString()
  })
}

// this is used to make sure that all events, whether they were fired before or
// after signup, are assigned to the same user
export const alias = id => {
  window.analytics.alias(id)
}

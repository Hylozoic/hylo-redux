import { partial } from 'lodash'

// These strings were not used prior to hylo-redux
export const EDITED_USER_SETTINGS = 'Edit user settings'

// These strings correspond to the names of events in Mixpanel with historical
// data, so they should be changed with care
export const CLICKTHROUGH = 'Clickthrough'
export const SHOWED_POST_COMMENTS = 'Post: Comments: Show'
export const STARTED_LOGIN = 'Login start'
export const STARTED_SIGNUP = 'Signup start'
export const VIEWED_COMMUNITY = 'Community: Load Community'
export const VIEWED_NOTIFICATIONS = 'Notifications: View'
export const VIEWED_PERSON = 'Member Profiles: Loaded a profile'
export const VIEWED_SELF = 'Member Profiles: Loaded Own Profile'

export function trackEvent (eventName, options) {
  let track = partial(window.analytics.track, eventName)
  switch (eventName) {
    case VIEWED_COMMUNITY:
      let { community: { slug } } = options
      track({community_slug: slug})
      break
    case VIEWED_PERSON:
      let { person: { id, name } } = options
      track({id, name})
      break
    case SHOWED_POST_COMMENTS:
      let { post } = options
      track({post_id: post.id})
      break
    case CLICKTHROUGH:
      track(options)
      break
    case EDITED_USER_SETTINGS:
    case STARTED_LOGIN:
    case STARTED_SIGNUP:
    case VIEWED_NOTIFICATIONS:
    case VIEWED_SELF:
      track()
      break
    default:
      throw new Error(`Don't know how to handle event named "${name}"`)
  }

  return Promise.resolve()
}

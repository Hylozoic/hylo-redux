import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { defer, prefetch } from 'react-fetcher'
import {
  markActivityRead,
  markAllActivitiesRead,
  navigate,
  thank
} from '../actions'
import { fetchActivity } from '../actions/activity'
import { get, map } from 'lodash/fp'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
import Avatar from '../components/Avatar'
import truncate from 'trunc-html'
import { humanDate } from '../util/text'
import { VIEWED_NOTIFICATIONS, trackEvent } from '../util/analytics'
import { postUrl } from '../routes'
import { getCurrentCommunity } from '../models/community'
const { array, bool, func, number, object } = React.PropTypes
import decode from 'ent/decode'
import { getActivitiesProps, actionText, bodyText } from '../models/activity'

const Notifications = compose(
  prefetch(({ dispatch, params: { id } }) => dispatch(fetchActivity(0, true, id))),
  connect(state => {
    const community = getCurrentCommunity(state)
    const slug = get('slug', community) || 'all'
    return {
      ...getActivitiesProps(slug, state),
      currentUser: state.people.current
    }
  }),
  defer(() => trackEvent(VIEWED_NOTIFICATIONS))
)((props, context) => {
  const { currentUser, dispatch, total, pending, params } = props
  const offset = props.activities.length
  const loadMore = !pending && offset < total
    ? () => dispatch(fetchActivity(offset, false, params.id))
    : () => {}

  const activities = props.activities.map(activity =>
    activity.comment_id
      ? {...activity, comment: props.comments[activity.comment_id]}
      : activity)

  const markAllRead = () =>
    dispatch(markAllActivitiesRead(params.id, map('id', activities)))

  return <div>
    <div className='list-controls'>
      <button onClick={markAllRead}>
        Mark all as read
      </button>
    </div>
    <div className='activities'>
      {activities.map(activity =>
        <Activity key={activity.id} {...{activity, currentUser, dispatch}}/>)}
      <ScrollListener onBottom={loadMore}/>
    </div>
  </div>
})

Notifications.propTypes = {
  activities: array,
  comments: object,
  pending: bool,
  dispatch: func,
  total: number,
  currentUser: object
}

export default Notifications

const Activity = ({ activity, currentUser, dispatch }) => {
  const {
    actor, action, post, comment, comment_id, unread, created_at, meta: { reasons }
  } = activity
  let { isThanked } = comment || {}
  const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

  let text = bodyText(action, comment, post)

  let postName = post.tag === 'welcome'
    ? `${post.relatedUsers[0].name}'s' welcoming post`
    : truncate(decode(post.name), 140).html

  let thankLinkText = isThanked
    ? `You thanked ${actor.name.split(' ')[0]}`
    : 'Say thanks'

  let visit = () => {
    if (unread) dispatch(markActivityRead(activity.id))
    dispatch(navigate(postUrl(post.id, get('id', comment))))
  }

  return <div key={activity.id} className={cx('activity', {unread})}>
    <Avatar person={actor}/>
    <div className='content'>
      <div className='title'>
        {actor.name}
        &nbsp;{actionText(action, comment, post, reasons)}&nbsp;
        <a onClick={visit}>{postName}</a>
      </div>

      {text && <div className='body-text' dangerouslySetInnerHTML={{__html: text}}/>}

      <div className='controls meta'>
        {humanDate(created_at)}
        {comment && <span>
          {spacer}
          <a onClick={() => dispatch(thank(comment_id, currentUser))}>
            {thankLinkText}
          </a>
          {spacer}
          <a onClick={visit}>Reply</a>
        </span>}
      </div>
    </div>
  </div>
}

import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { defer, prefetch } from 'react-fetcher'
import {
  FETCH_ACTIVITY,
  fetchActivity,
  markActivityRead,
  markAllActivitiesRead,
  navigate,
  thank
} from '../actions'
import { filter, get, includes, map } from 'lodash'
import { find } from 'lodash/fp'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
import Avatar from '../components/Avatar'
import truncate from 'html-truncate'
import { present, humanDate } from '../util/text'
import { VIEWED_NOTIFICATIONS, trackEvent } from '../util/analytics'
import { postUrl } from '../routes'
import { getCurrentCommunity } from '../models/community'
const { array, bool, func, number, object } = React.PropTypes

const Notifications = compose(
  prefetch(({ dispatch, params: { id } }) => dispatch(fetchActivity(0, true, id))),
  connect(state => {
    const { activitiesByCommunity, totalActivities } = state
    const community = getCurrentCommunity(state)
    const slug = community ? community.slug : 'all'
    const activities = map(activitiesByCommunity[slug], id => state.activities[id])
    const comments = filter(activities.map(a => a.comment_id))
    .reduce((acc, cid) => ({...acc, [cid]: state.comments[cid]}), {})

    return {
      activities,
      comments,
      currentUser: state.people.current,
      total: Number(totalActivities[slug]),
      pending: state.pending[FETCH_ACTIVITY]
    }
  }),
  defer(() => trackEvent(VIEWED_NOTIFICATIONS))
)(props => {
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
    dispatch(markAllActivitiesRead(params.id, map(activities, 'id')))

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

const actionText = (action, comment, post, reasons) => {
  switch (action) {
    case 'mention':
      if (!comment) return `mentioned you in their ${post.tag}`
      return 'mentioned you in a comment on'
    case 'comment':
      return 'commented on'
    case 'followAdd':
      return `added you to the ${post.tag}`
    case 'follow':
      return 'followed'
    case 'unfollow':
      return 'stopped following'
    case 'tag':
      const tagReason = find(r => r.startsWith('tag: '), reasons)
      const tag = tagReason.split(': ')[1]
      return `made a new post tagged with #${tag}:`
  }
}

const bodyText = (action, comment, post) => {
  if (includes(['followAdd', 'follow', 'unfollow'], action)) {
    return ''
  }
  const text = get(comment, 'text') || get(post, 'description')
  const slug = get(post, 'communities.0.slug')
  return present(text, {slug, maxlength: 200})
}

const Activity = ({ activity, currentUser, dispatch }) => {
  const {
    actor, action, post, comment, comment_id, unread, created_at, meta: { reasons }
  } = activity
  let { isThanked } = comment || {}
  const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

  let text = bodyText(action, comment, post)

  let postName = post.tag === 'welcome'
    ? `${post.relatedUsers[0].name}'s' welcoming post`
    : truncate(post.name, 140)

  let thankLinkText = isThanked
    ? `You thanked ${actor.name.split(' ')[0]}`
    : 'Say thanks'

  let thankTooltipText = isThanked
    ? 'click to take back your thanks'
    : 'click to give thanks for this comment'

  let visit = () => {
    if (unread) dispatch(markActivityRead(activity.id))
    dispatch(navigate(postUrl(post.id, get(comment, 'id'))))
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
          <a tooltip={thankTooltipText} tooltip-popup-delay='500'
            onClick={() => dispatch(thank(comment_id, currentUser))}>
            {thankLinkText}
          </a>
          {spacer}
          <a onClick={visit}>Reply</a>
        </span>}
      </div>
    </div>
  </div>
}

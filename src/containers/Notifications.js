import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { defer, prefetch } from 'react-fetcher'
import {
  markActivityRead, markAllActivitiesRead, navigate, showModal
} from '../actions'
import { fetchActivity } from '../actions/activity'
import { get, map, isEmpty } from 'lodash/fp'
import cx from 'classnames'
import ScrollListener from '../components/ScrollListener'
import Avatar from '../components/Avatar'
import truncate from 'trunc-html'
import { humanDate } from '../util/text'
import { VIEWED_NOTIFICATIONS, trackEvent } from '../util/analytics'
import { getCurrentCommunity } from '../models/community'
const { array, bool, func, number, object } = React.PropTypes
import decode from 'ent/decode'
import {
  getActivitiesProps, actionText, bodyText, destination, activityAction
} from '../models/activity'
import { Modal } from '../components/Modal'
import A from '../components/A'
import { NonLinkAvatar } from '../components/Avatar'
import Dropdown from '../components/Dropdown'
import Icon from '../components/Icon'
import { modalWrapperCSSId } from '../components/Modal'

const Notifications = compose(
  prefetch(({ dispatch, params: { id } }) => dispatch(fetchActivity(0, true, id))),
  connect(state => {
    const community = getCurrentCommunity(state)
    const slug = get('slug', community) || 'all'
    return getActivitiesProps(slug, state)
  }),
  defer(() => trackEvent(VIEWED_NOTIFICATIONS))
)((props, context) => {
  const { dispatch, total, pending, params } = props
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
        <Activity key={activity.id} activity={activity} />)}
      <ScrollListener onBottom={loadMore} />
    </div>
  </div>
})

Notifications.propTypes = {
  activities: array,
  comments: object,
  pending: bool,
  dispatch: func,
  total: number
}

export default Notifications

const Activity = ({ activity }, { dispatch }) => {
  const {
    actor, action, post, comment, community, unread, created_at, meta: { reasons }
  } = activity
  const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

  let text = bodyText(action, comment, post)

  let postName = !isEmpty(post) && post.tag === 'welcome'
    ? `${post.relatedUsers[0].name}'s' welcoming post`
    : truncate(decode(post.name), 140).html

  let visit = () => {
    if (unread) dispatch(markActivityRead(activity.id))
    dispatch(navigate(destination(activity)))
  }

  return <div key={activity.id} className={cx('activity', {unread})}>
    <Avatar person={actor} />
    <div className='content'>
      <div className='title'>
        {actor.name}
        &nbsp;{actionText(action, comment, post, community, reasons)}&nbsp;
        {postName && <a onClick={visit}>{postName}</a>}
      </div>

      {text && <div className='body-text' dangerouslySetInnerHTML={{__html: text}} />}

      <div className='controls meta'>
        {humanDate(created_at)}
        {comment && <span>
          {spacer}
          <a onClick={visit}>Reply</a>
        </span>}
      </div>
    </div>
  </div>
}
Activity.contextTypes = {dispatch: func}

@connect((state, props) => getActivitiesProps('all', state))
export class NotificationsModal extends React.Component {
  static propTypes = {
    dispatch: func,
    activities: array,
    comments: object,
    total: number,
    pending: bool,
    onCancel: func
  }

  componentDidMount () {
    this.props.dispatch(fetchActivity(0, true))
  }

  render () {
    const { dispatch, activities, comments, total, pending, onCancel } = this.props
    const offset = activities.length
    const loadMore = !pending && offset < total
      ? () => dispatch(fetchActivity(offset, false))
      : () => {}

    const scrollListenerProps = {
      onBottom: loadMore,
      elementId: modalWrapperCSSId
    }

    const markAllRead = () =>
      dispatch(markAllActivitiesRead(null, map('id', activities)))

    return <Modal id='notifications-modal' onCancel={onCancel}
      title={<button onClick={markAllRead}>
        Mark all as read
      </button>}>
      <ul className='notifications-list' onClick={onCancel}>
        {activities.map(activity => <li key={activity.id}>
          <NotificationsDropdownItem activity={activity}
            comment={comments[activity.comment_id]} />
        </li>)}
      </ul>
      <ScrollListener {...scrollListenerProps} />
    </Modal>
  }
}

export const NotificationsDropdown = connect(
  (state, props) => getActivitiesProps('all', state)
)(props => {
  const { dispatch, newCount, activities, comments, pending } = props
  return <Dropdown alignRight rivalrous='nav' className='notifications-list'
    onFirstOpen={() => dispatch(fetchActivity(0, true))}
    toggleChildren={<span>
      <Icon name='Bell' />
      {newCount > 0 && <div className='badge'>{newCount}</div>}
    </span>}>
    {pending && <li className='loading'>Loading...</li>}
    {activities.slice(0, 20).map(activity => <li key={activity.id}>
      <NotificationsDropdownItem activity={activity}
        comment={comments[activity.comment_id]} />
    </li>)}
    {!pending && <li className='bottom'>
      <a onClick={() => dispatch(showModal('notifications'))}>See all</a>
    </li>}
  </Dropdown>
})

const NotificationsDropdownItem = ({ activity, comment }, { dispatch }) => {
  const { id, actor, action, post, unread, community, meta: { reasons } } = activity
  const postName = !isEmpty(post) && truncate(decode(post.name), 140).html
  const markAsRead = () => unread && dispatch(markActivityRead(id))
  const onClick = () => {
    markAsRead()
    dispatch(activityAction(activity))
  }
  return <A to={destination(activity)} className={cx({unread})}
    onClick={onClick}>
    {unread && <div className='dot-badge' />}
    <NonLinkAvatar person={actor} />
    <span>
      <strong>{actor.name}</strong>&nbsp;
      {actionText(action, comment, post, community, reasons)} {postName}
    </span>
  </A>
}
NotificationsDropdownItem.contextTypes = {dispatch: func}

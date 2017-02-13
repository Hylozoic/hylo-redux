import React, { PropTypes } from 'react'
import { timeRange, timeRangeFull } from '../util/text'
import decode from 'ent/decode'
import cx from 'classnames'
import { imageUrl } from '../models/post'
import { canCommentOnPost } from '../models/currentUser'
import { presentDescription } from './PostDetails'
import ClickCatcher from './ClickCatcher'
import CommentSection from './CommentSection'
import Icon from './Icon'
import PostHeader from './PostHeader'
import EventAttendance from './EventAttendance'

export default function EventPost (
  { post, comments },
  { community, communities, currentUser }
) {
  const { name, starts_at, ends_at, location } = post
  const description = presentDescription(post, community)
  const title = decode(name || '')
  const start = new Date(starts_at)
  const end = ends_at && new Date(ends_at) // eslint-disable-line
  const image = imageUrl(post, false)
  const canComment = canCommentOnPost(currentUser, post)

  return <div className='post event boxy-post'>
    <PostHeader post={post} communities={communities} />
    <p className='title post-section'>{title}</p>

    <div className='box'>
      {image && <div className='image'>
        <img src={image} />
      </div>}
      <EventAttendance post={post} limit={5} showButton
        className={cx({'no-image': !image})} />
      <div className='time'>
        <Icon name='Calendar' />
        <span title={timeRangeFull(start, end)}>
          {timeRange(start, end)}
        </span>
      </div>
      <div className='location'>
        <Icon name='Pin-1' />
        <span title={location}>{location}</span>
      </div>
      {description && <div className='details'>
        <ClickCatcher dangerouslySetInnerHTML={{__html: description}} />
      </div>}
    </div>
    <CommentSection {...{post, comments, canComment}} expanded />
  </div>
}
EventPost.propTypes = {
  post: PropTypes.object.isRequired,
  comments: PropTypes.array
}
EventPost.contextTypes = {
  communities: PropTypes.array,
  currentUser: PropTypes.object
}

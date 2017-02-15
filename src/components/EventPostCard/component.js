import React, { PropTypes } from 'react'
import { timeRangeBrief, timeRangeFull } from '../../util/text'
import { imageUrl } from '../../models/post'
import { canCommentOnPost } from '../../models/currentUser'
import { presentDescription } from '../PostDetails'
import A from '../A'
import LazyLoader from '../LazyLoader'
import ClickCatcher from '../ClickCatcher'
import PostMenu from '../PostMenu'
import CommentSection from '../CommentSection'
import EventAttendance from '../EventAttendance'

export default function EventPostCard (
  { post, comments, community, isMobile, navigate },
  { currentUser }
) {
  const { starts_at, ends_at, user, id, name } = post
  const start = new Date(starts_at)
  const end = ends_at && new Date(ends_at) // eslint-disable-line
  const time = timeRangeBrief(start, end)
  const timeFull = timeRangeFull(start, end)

  const description = presentDescription(post, community, {maxlength: 200})
  const url = `/p/${id}`
  const backgroundImage = `url(${imageUrl(post)})`

  const canComment = canCommentOnPost(currentUser, post)

  return <div className='post event-summary'>
    <PostMenu post={post} />
    <LazyLoader className='image'>
      <A to={url} style={{backgroundImage}} />
    </LazyLoader>
    <div className='meta'>
      <A className='user-name' to={`/u/${user.id}`}>{user.name}</A>
      <span className='time' title={timeFull}>{time}</span>
    </div>
    <A className='title' to={url}>{name}</A>
    {!isMobile && description && <div className='details'>
      <ClickCatcher dangerouslySetInnerHTML={{__html: description}} />
    </div>}
    <EventAttendance post={post} showButton limit={7} alignRight />
    <div className='comments-section-spacer' />
    {canComment &&
      <CommentSection {...{post, comments, canComment}} onExpand={() => navigate(url)} />}
  </div>
}
EventPostCard.propTypes = {
  post: PropTypes.object.isRequired
}
EventPostCard.contextTypes = {
  currentUser: PropTypes.object
}

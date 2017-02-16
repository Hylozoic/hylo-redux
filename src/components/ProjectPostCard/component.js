/* eslint-disable camelcase */
import React, { PropTypes } from 'react'
import { textLength, truncate } from '../../util/text'
import { imageUrl } from '../../models/post'
import { canCommentOnPost } from '../../models/currentUser'
import A from '../A'
import { presentDescription } from '../PostDetails'
import LazyLoader from '../LazyLoader'
import CommentSection from '../CommentSection'
import ClickCatcher from '../ClickCatcher'
import { Supporters, Deadline } from '../ProjectPost/component'

export default function ProjectPostCard ({ post, community, comments, isMobile, navigate }, { currentUser }) {
  const { name, user, ends_at, id } = post
  const url = `/p/${post.id}`
  const backgroundImage = `url(${imageUrl(post)})`
  const canComment = canCommentOnPost(currentUser, post)

  let description = presentDescription(post, community)
  const truncated = textLength(description) > 140
  if (truncated) description = truncate(description, 140)

  const spacer = <span>&nbsp; •&nbsp; </span>

  return <div className='post project-summary'>
    <LazyLoader className='image'>
      <A to={url} style={{backgroundImage}} />
    </LazyLoader>
    <div className='meta'>
      {ends_at && <span>
        <Deadline time={ends_at} />
        {spacer}
      </span>}
      <A to={`/u/${user.id}`}>{user.name}</A>
    </div>
    <A className='title' to={url}>{name}</A>
    {!isMobile && description && <div className='details-row'>
      <ClickCatcher className='details'
        dangerouslySetInnerHTML={{__html: description}} />
      {truncated && <span>
        <A to={`/p/${id}`} className='show-more'>Show&nbsp;more</A>
      </span>}
    </div>}
    <Supporters post={post} simple />
    <div className='comments-section-spacer' />
    <CommentSection onExpand={() => navigate(url)}
      isProjectRequest {...{post, canComment, comments}} />
  </div>
}
ProjectPostCard.propTypes = {
  post: PropTypes.object.isRequired,
  navigate: PropTypes.func.isRequired,
  community: PropTypes.object,
  isMobile: PropTypes.bool
}
ProjectPostCard.contextTypes = {
  currentUser: PropTypes.object
}

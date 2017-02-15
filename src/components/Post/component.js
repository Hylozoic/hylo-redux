/* eslint-disable camelcase */
import React, { PropTypes } from 'react'
import { first, includes, map } from 'lodash'
import { find, get } from 'lodash/fp'
import cx from 'classnames'
import decode from 'ent/decode'
import { sanitize } from 'hylo-utils/text'
import { linkifyHashtags } from '../../util/linkify'
import { same } from '../../models'
import { isChildPost, isCompleteRequest } from '../../models/post'
import { canEditPost, canCommentOnPost, hasFeature } from '../../models/currentUser'
import { CONTRIBUTORS } from '../../config/featureFlags'
import ClickCatcher from '../ClickCatcher'
import PostHeader from '../PostHeader'
import PostDetails from '../PostDetails'
import CompleteRequest from '../CompleteRequest'
import RequestCompleteHeader from '../RequestCompleteHeader'
import CommentSection from '../CommentSection'
import LinkPreview from '../LinkPreview'
import LinkedPersonSentence from '../LinkedPersonSentence'
import Attachments from '../Attachments'
import LazyLoader from '../LazyLoader'
import Icon from '../Icon'

export default function Post (
  { post, parentPost, comments, expanded, onExpand, inActivityCard, actions },
  { currentUser }
) {
  const { tag, media, linkPreview } = post
  const { voteOnPost, showPopoverHandler } = actions
  const communities = parentPost ? parentPost.communities : post.communities
  const community = communities[0]
  const image = find(m => m.type === 'image', media)
  const classes = cx('post', tag, {image, expanded: expanded && !inActivityCard})
  const title = linkifyHashtags(decode(sanitize(post.name || '')), get('slug', community))
  const isRequest = post.tag === 'request'
  const isComplete = isCompleteRequest(post)
  const canEdit = canEditPost(currentUser, post)
  const canComment = canCommentOnPost(currentUser, isChildPost(post) ? parentPost : post)

  let selectedComments = comments
  if (inActivityCard && !expanded) selectedComments = comments.slice(-1)

  return <div className={classes}>
    <a name={`post-${post.id}`} />
    <PostHeader {...{post, parentPost, communities, expanded}} />
    <ClickCatcher tag='p' className='title post-section' dangerouslySetInnerHTML={{__html: title}} />
    {image && <LazyLoader>
      <img src={image.url} className='post-section full-image' />
    </LazyLoader>}
    <PostDetails {...{post, community, expanded, onExpand, showPopoverHandler}} />
    {linkPreview && <LinkPreview {...{linkPreview}} />}
    <div className='voting post-section'>
      <VoteButton post={post} forUser={currentUser} onClick={() => voteOnPost(post, currentUser)} />
      <Voters post={post} />
    </div>
    <Attachments post={post} />
    {hasFeature(currentUser, CONTRIBUTORS) && isComplete &&
      <RequestCompleteHeader post={post} canEdit={canEdit} />}
    {hasFeature(currentUser, CONTRIBUTORS) && isRequest && !isComplete &&
      <CompleteRequest post={post} canEdit={canEdit} />}
    <CommentSection {...{comments: selectedComments, post, expanded, onExpand, canComment}} />
  </div>
}
Post.propTypes = {
  post: PropTypes.shape({
    communities: PropTypes.arrayOf(PropTypes.object.isRequired).isRequired
  }),
  comments: PropTypes.array.isRequired,
  actions: PropTypes.shape({
    voteOnPost: PropTypes.func.isRequired
  }),
  parentPost: PropTypes.object,
  expanded: PropTypes.bool,
  onExpand: PropTypes.func,
  inActivityCard: PropTypes.bool
}
Post.contextTypes = {
  currentUser: PropTypes.object
}

function Voters ({ post }) {
  const voters = post.voters || []
  const onlyAuthorIsVoting = voters.length === 1 && same('id', first(voters), post.user)
  const votersExist = voters.length > 0 && !onlyAuthorIsVoting
  return (votersExist
    ? <LinkedPersonSentence people={voters} className='voters meta'>
      liked this.
    </LinkedPersonSentence>
    : <span />
  )
}
Voters.propTypes = {
  post: PropTypes.object.isRequired
}

function VoteButton ({ forUser, post, onClick }) {
  let myVote = includes(map(post.voters, 'id'), (forUser || {}).id)
  return <a className='vote-button' onClick={onClick}>
    {myVote ? <Icon name='Heart2' /> : <Icon name='Heart' />}
    {myVote ? 'Liked' : 'Like'}
  </a>
}

<<<<<<< HEAD
/* eslint-disable camelcase */
import React from 'react'
import { difference, first, includes, map, some, sortBy } from 'lodash'
import { find, filter, get, uniq } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
=======
import React, { PropTypes } from 'react'
import { difference, first, includes, map } from 'lodash'
import { find, filter, get } from 'lodash/fp'
>>>>>>> Better decouple Post component
import cx from 'classnames'
import cheerio from 'cheerio'
import decode from 'ent/decode'
import { present, textLength, truncate, appendInP } from '../../util/text'
import { sanitize } from 'hylo-utils/text'
import { linkifyHashtags } from '../../util/linkify'
import { tagUrl } from '../../routes'
import { same } from '../../models'
import { isChildPost, isCompleteRequest } from '../../models/post'
import { canEditPost, canCommentOnPost, hasFeature } from '../../models/currentUser'
import { CONTRIBUTORS } from '../../config/featureFlags'
import { ClickCatchingSpan } from '../ClickCatcher'
import PostHeader from '../PostHeader'
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
  const { voteOnPost, onMouseOver } = actions
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
    <p className='title post-section' dangerouslySetInnerHTML={{__html: title}} />
    {image &&
      <LazyLoader>
        <img src={image.url} className='post-section full-image' />
      </LazyLoader>}
    <Details {...{post, community, expanded, onExpand, onMouseOver}} />
    {linkPreview &&
      <LinkPreview {...{linkPreview}} />}
    <div className='voting post-section'>
      <VoteButton post={post} forUser={currentUser} onClick={() => voteOnPost(post, currentUser)} />
      <Voters post={post} />
    </div>
    <Attachments post={post} />
    {hasFeature(currentUser, CONTRIBUTORS) && isComplete &&
      <RequestCompleteHeader post={post} canEdit={canEdit} />}
    <CommentSection {...{comments: selectedComments, post, expanded, onExpand, canComment}} />
    {hasFeature(currentUser, CONTRIBUTORS) && isRequest && !isComplete &&
      <CompleteRequest post={post} canEdit={canEdit} />}
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

export const presentDescription = (post, community, opts = {}) =>
  present(sanitize(post.description), {slug: get('slug', community), ...opts})

export function Details ({ post, community, expanded, onExpand, onMouseOver }) {
  const truncatedSize = 300
  const { tag } = post
  const slug = get('slug', community)
  let description = presentDescription(post, community)
  let extractedTags = []
  const truncated = !expanded && textLength(description) > truncatedSize
  if (truncated) {
    const orig = description
    description = truncate(description, truncatedSize)
    extractedTags = extractTags(description, orig, tag)
  }
  if (description) description = appendInP(description, '&nbsp;')

  return <div className='post-section details'>
    <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}} />
    {truncated && <span>
      <wbr />
      <a onClick={() => onExpand(null)} className='show-more'>Show&nbsp;more</a>
      &nbsp;
    </span>}
    {extractedTags.map(tag => <span key={tag}>
      <wbr />
      <HashtagLink tag={tag} slug={slug} onMouseOver={onMouseOver} />
      &nbsp;
    </span>)}
    {tag && <HashtagLink tag={tag} slug={slug} />}
  </div>
}

export function Voters ({ post }) {
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

function VoteButton ({ forUser, post, onClick }) {
  let myVote = includes(map(post.voters, 'id'), (forUser || {}).id)
  return <a className='vote-button' onClick={onClick}>
    {myVote ? <Icon name='Heart2' /> : <Icon name='Heart' />}
    {myVote ? 'Liked' : 'Like'}
  </a>
}

function HashtagLink ({ tag, slug, onMouseOver }) {
  return <a className='hashtag' href={tagUrl(tag, slug)} {...{onMouseOver}}>
    {`#${tag}`}
  </a>
}

const getTags = text =>
  cheerio.load(text)('.hashtag').toArray().map(tag =>
    tag.children[0].data.replace(/^#/, ''))

const extractTags = (shortDesc, fullDesc, omitTag) => {
  const tags = filter(t => t !== omitTag, getTags(fullDesc))
  return tags.length === 0 ? [] : difference(tags, getTags(shortDesc))
}

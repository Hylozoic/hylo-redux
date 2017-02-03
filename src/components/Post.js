/* eslint-disable camelcase */
import React from 'react'
import { difference, first, includes, map, some, sortBy } from 'lodash'
import { find, filter, get, uniq } from 'lodash/fp'
const { array, bool, func, object, string } = React.PropTypes
import cx from 'classnames'
import cheerio from 'cheerio'
import decode from 'ent/decode'
import {
  humanDate, nonbreaking, present, textLength, truncate, appendInP
} from '../util/text'
import { sanitize } from 'hylo-utils/text'
import { linkifyHashtags } from '../util/linkify'
import { tagUrl } from '../routes'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { isMobile } from '../client/util'
import { same } from '../models'
import {
  denormalizedPost, getComments, isPinned, isChildPost, isCompleteRequest
} from '../models/post'
import {
  canEditPost, canModerate, canCommentOnPost, hasFeature
} from '../models/currentUser'
import { getCurrentCommunity } from '../models/community'
import {
  showModal,
  navigate,
  followPost,
  removePost,
  startPostEdit,
  voteOnPost,
  pinPost
} from '../actions'
import { CONTRIBUTORS } from '../config/featureFlags'
import CompleteRequest from './CompleteRequest'
import RequestCompleteHeader from './RequestCompleteHeader'
import CommentSection from './CommentSection'
import LinkPreview from './LinkPreview'
import LinkedPersonSentence from './LinkedPersonSentence'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import Attachments from './Attachments'
import LazyLoader from './LazyLoader'
import Icon from './Icon'
import { ClickCatchingP, ClickCatchingSpan } from './ClickCatcher'
import { handleMouseOver } from './Popover'

const spacer = <span>&nbsp; •&nbsp; </span>

export const presentDescription = (post, community, opts = {}) =>
  present(sanitize(post.description), {slug: get('slug', community), ...opts})

export class Post extends React.Component {
  static propTypes = {
    post: object,
    parentPost: object,
    community: object,
    comments: array,
    dispatch: func,
    expanded: bool,
    onExpand: func,
    commentId: string,
    inActivityCard: bool
  }

  static contextTypes = {
    currentUser: object
  }

  render () {
    const {
      inActivityCard, post, parentPost, expanded, onExpand, community, dispatch
    } = this.props
    let { comments } = this.props
    if (inActivityCard && !expanded) comments = comments.slice(-1)
    const { currentUser } = this.context
    const { tag, media, linkPreview } = post
    const communities = parentPost ? parentPost.communities : post.communities
    const image = find(m => m.type === 'image', media)
    const classes = cx('post', tag, {image, expanded: expanded && !inActivityCard})
    const title = linkifyHashtags(decode(sanitize(post.name || '')), get('slug', community))

    const isRequest = post.tag === 'request'
    const isComplete = isCompleteRequest(post)
    const canEdit = canEditPost(currentUser, post)
    const canComment = canCommentOnPost(currentUser, isChildPost(post) ? parentPost : post)

    return <div className={classes}>
      <a name={`post-${post.id}`} />
      <Header post={post} parentPost={parentPost} communities={communities} expanded={expanded} />
      <ClickCatchingP className='title post-section' dangerouslySetInnerHTML={{__html: title}} />
      {image && <LazyLoader>
        <img src={image.url} className='post-section full-image' />
      </LazyLoader>}
      <Details {...{post, expanded, onExpand}} />
      {linkPreview && <LinkPreview {...{linkPreview}} />}
      <div className='voting post-section'>
        <VoteButton post={post} onClick={() => dispatch(voteOnPost(post, currentUser))} />
        <Voters post={post} />
      </div>
      <Attachments post={post} />
      {hasFeature(currentUser, CONTRIBUTORS) && isComplete &&
        <RequestCompleteHeader post={post} canEdit={canEdit} />}
      <CommentSection {...{post, expanded, onExpand, comments, canComment}} />
      {hasFeature(currentUser, CONTRIBUTORS) && isRequest && !isComplete &&
        <CompleteRequest post={post} canEdit={canEdit} />}
    </div>
  }
}

export default compose(connect((state, {post}) => {
  return {
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    post: denormalizedPost(post, state)
  }
}))(Post)

export const Header = ({ post, parentPost, communities, expanded }, { currentUser, dispatch }) => {
  const { type } = post
  const person = type === 'welcome' ? post.relatedUsers[0] : post.user
  const createdAt = new Date(post.created_at)
  const isChild = isChildPost(post)
  return <div className='header'>
    <Menu expanded={expanded} post={post} isChild={isChild} />
    <Avatar person={person} showPopover />
    {type === 'welcome'
      ? <WelcomePostHeader post={post} communities={communities} />
      : <div onMouseOver={handleMouseOver(dispatch)}>
        <A className='name' to={`/u/${person.id}`}>
          {person.name}
        </A>
        <span className='meta'>
          <A to={`/p/${post.id}`} title={createdAt}>
            {nonbreaking(humanDate(createdAt))}
          </A>
          {(communities || parentPost) && <AppearsIn communities={communities} parentPost={parentPost} />}
          {post.public && <span>{spacer}Public</span>}
        </span>
      </div>}
  </div>
}
Header.contextTypes = {currentUser: object, dispatch: func}

const AppearsIn = ({ communities, parentPost }, { community }) => {
  communities = communities || []
  if (community) communities = sortBy(communities, c => c.id !== community.id)
  const { length } = communities
  if (length === 0 && !parentPost) return null
  const communityLink = community => <A to={`/c/${community.slug}`}>{community.name}</A>
  const parentPostLink = parentPost => <span>
    <A to={`/p/${parentPost.id}`} className='project-link'>{parentPost.name}</A>
    {length > 0 && spacer}
  </span>

  return <span className='communities'>
    &nbsp;in&nbsp;
    {parentPost && parentPostLink(parentPost)}
    {length > 0 && communityLink(communities[0])}
    {length > 1 && <span> + </span>}
    {length > 1 && <Dropdown className='post-communities-dropdown'
      toggleChildren={<span>{length - 1} other{length > 2 ? 's' : ''}</span>}>
      {communities.slice(1).map(c => <li key={c.id}>{communityLink(c)}</li>)}
    </Dropdown>}
  </span>
}
AppearsIn.contextTypes = {community: object}

const getTags = text =>
  cheerio.load(text)('.hashtag').toArray().map(tag =>
    tag.children[0].data.replace(/^#/, ''))

const extractTags = (shortDesc, fullDesc, omitTag) => {
  const tags = filter(t => t !== omitTag, getTags(fullDesc))
  return tags.length === 0 ? [] : uniq(difference(tags, getTags(shortDesc)))
}

const HashtagLink = ({ tag, slug }, { dispatch }) => {
  const onMouseOver = handleMouseOver(dispatch)
  return <a className='hashtag' href={tagUrl(tag, slug)} {...{onMouseOver}}>
    {`#${tag}`}
  </a>
}
HashtagLink.contextTypes = {dispatch: func}

export const Details = ({ post, expanded, onExpand }, { community, dispatch }) => {
  const truncatedSize = 300
  const { tag } = post
  if (!community) community = post.communities[0]
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
      <HashtagLink tag={tag} slug={slug} />
      &nbsp;
    </span>)}
    {tag && <HashtagLink tag={tag} slug={slug} />}
  </div>
}
Details.contextTypes = {dispatch: func, community: object}

const WelcomePostHeader = ({ post, communities }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <div>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined
    <span />
    {community ? <span>
      <A to={`/c/${community.slug}`}>{community.name}</A>.
      <span />
      <a className='open-comments'>
        Welcome them!
      </a>
    </span>
    : <span>
        a community that is no longer active.
      </span>}
  </div>
}

export const Menu = ({ post, expanded, isChild }, { dispatch, currentUser, community }) => {
  const canEdit = canEditPost(currentUser, post)
  const following = some(post.follower_ids, id => id === get('id', currentUser))
  const pinned = isPinned(post, community)
  const edit = () => isMobile()
    ? dispatch(navigate(`/p/${post.id}/edit`))
    : dispatch(startPostEdit(post)) &&
      expanded && !isChild && dispatch(showModal('post-editor', {post}))
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
    dispatch(removePost(post.id))
  const pin = () => dispatch(pinPost(get('slug', community), post.id))

  const toggleChildren = pinned
    ? <span className='pinned'><span className='label'>Pinned</span><span className='icon-More' /></span>
    : <span className='icon-More' />

  return <Dropdown className='post-menu' alignRight {...{toggleChildren}}>
    {canModerate(currentUser, community) && !isChild && <li>
      <a onClick={pin}>{pinned ? 'Unpin post' : 'Pin post'}</a>
    </li>}
    {canEdit && <li><a className='edit' onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => dispatch(followPost(post.id, currentUser))}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    {/* <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li> */}
  </Dropdown>
}
Menu.contextTypes = {currentUser: object, dispatch: func, community: object}

export const VoteButton = ({ post, onClick }, { currentUser }) => {
  let myVote = includes(map(post.voters, 'id'), (currentUser || {}).id)
  return <a className='vote-button' onClick={onClick}>
    {myVote ? <Icon name='Heart2' /> : <Icon name='Heart' />}
    {myVote ? 'Liked' : 'Like'}
  </a>
}
VoteButton.contextTypes = {currentUser: object}

export const Voters = ({ post }) => {
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

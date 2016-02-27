import React from 'react'
import { Link } from 'react-router'
import { filter, find, get, isEmpty, first, map, pick, some, without } from 'lodash'
import { projectUrl } from '../routes'
const { array, bool, func, object } = React.PropTypes
import cx from 'classnames'
import { humanDate, nonbreaking, present, sanitize, timeRange, timeRangeFull } from '../util/text'
import truncate from 'html-truncate'
import A from './A'
import Avatar from './Avatar'
import Dropdown from './Dropdown'
import ClickCatchingDiv from './ClickCatchingDiv'
import Comment from './Comment'
import CommentForm from './CommentForm'
import RSVPControl from './RSVPControl'
import SharingDropdown from './SharingDropdown'
import { connect } from 'react-redux'
import { SHOWED_POST_COMMENTS, trackEvent } from '../util/analytics'
import {
  changeEventResponse,
  fetchComments,
  followPost,
  removePost,
  startPostEdit,
  voteOnPost
} from '../actions'
import { same } from '../models'
import decode from 'ent/decode'

const spacer = <span>&nbsp; •&nbsp; </span>

class Post extends React.Component {
  static propTypes = {
    post: object,
    onExpand: func,
    expanded: bool,
    showingComments: bool,
    communities: array,
    comments: array,
    commentsLoaded: bool,
    dispatch: func,
    commentingDisabled: bool,
    currentUser: object
  }

  static childContextTypes = {
    currentUser: object,
    dispatch: func,
    post: object,
    toggleComments: func
  }

  constructor (props) {
    super(props)
    this.state = {showingComments: props.showComments}
  }

  getChildContext () {
    return {
      ...pick(this.props, 'currentUser', 'dispatch', 'post'),
      toggleComments: this.toggleComments
    }
  }

  expand = () => {
    let { expanded, onExpand, post } = this.props
    if (!expanded) onExpand(post.id)
  }

  toggleComments = event => {
    event.stopPropagation()
    event.preventDefault()
    this.expand()

    let { post, commentsLoaded } = this.props
    if (!this.state.showingComments) {
      if (!commentsLoaded) this.props.dispatch(fetchComments(post.id))
      trackEvent(SHOWED_POST_COMMENTS, {post})
    }
    this.setState({showingComments: !this.state.showingComments})
  }

  render () {
    let { post, communities, comments, commentingDisabled, expanded } = this.props
    let { showingComments } = this.state

    let image = find(post.media, m => m.type === 'image')
    var classes = cx('post', post.type, {expanded: expanded, image: !!image})

    return <div className={classes} onClick={this.expand}>
      {post.type === 'welcome'
        ? <WelcomePostHeader communities={communities}/>
        : <NormalPostHeader expanded={expanded} image={image}/>}

      {expanded && <PostDetails
        {...{comments, showingComments, communities, commentingDisabled}}/>}
    </div>
  }
}

export default connect((state, { post }) => {
  let { comments, commentsByPost, people, communities } = state
  let commentIdsForPost = get(commentsByPost, post.id)
  return {
    commentsLoaded: !!commentIdsForPost,
    comments: map(commentIdsForPost, id => comments[id]),
    currentUser: people.current,
    communities: post.communities.map(id => find(communities, c => c.id === id))
  }
})(Post)

export const UndecoratedPost = Post // for testing

const NormalPostHeader = ({ image, expanded }, { post }) => {
  var style = image ? {backgroundImage: `url(${image.url})`} : {}
  let title = decode(post.name || '')
  let person = post.user

  let isEvent = post.type === 'event'
  if (isEvent) {
    let start = new Date(post.start_time)
    let end = post.end_time && new Date(post.end_time)
    var eventTime = timeRange(start, end)
    var eventTimeFull = timeRangeFull(start, end)
  }

  return <div>
    <div className='header'>
      {expanded && <CaretMenu/>}
      <Avatar person={person}/>
      <span className='name'>{person.name}</span>
      <PostMeta/>
    </div>

    <p className='title'>{title}</p>

    {isEvent && <p title={eventTimeFull} className='event-time'>
      <i className='glyphicon glyphicon-time'></i>
      {eventTime}
    </p>}

    {post.location && <p title='location' className='post-location'>
      <i className='glyphicon glyphicon-map-marker'></i>
      {post.location}
    </p>}

    {image && <div className='image' style={style}/>}
  </div>
}

NormalPostHeader.contextTypes = {post: object}

const WelcomePostHeader = ({ communities }, { post, toggleComments }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <div>
    <Avatar person={person}/>
    <div className='header'>
      <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined&ensp;
      {community
        ? <A to={`/c/${community.slug}`}>{community.name}</A>
        : <span>a community that is no longer active</span>
      }.&ensp;
      {community && <a className='open-comments' onClick={toggleComments}>Welcome them!</a>}
      <PostMeta/>
    </div>
  </div>
}

WelcomePostHeader.contextTypes = {post: object, toggleComments: func}

const CaretMenu = (props, { dispatch, post, currentUser }) => {
  let canEdit = same('id', currentUser, post.user)
  let following = some(post.followers, same('id', currentUser))

  const edit = () => dispatch(startPostEdit(post))
  const remove = () => confirm('Are you sure? This cannot be undone.') &&
    dispatch(removePost(post.id))

  return <Dropdown className='post-menu' alignRight={true}
    toggleChildren={<i className='icon-down'></i>}>
    {canEdit && <li><a onClick={edit}>Edit</a></li>}
    {canEdit && <li><a onClick={remove}>Remove</a></li>}
    <li>
      <a onClick={() => dispatch(followPost(post.id, currentUser))}>
        Turn {following ? 'off' : 'on'} notifications for this post
      </a>
    </li>
    <li>
      <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
    </li>
  </Dropdown>
}

CaretMenu.contextTypes = Post.childContextTypes

const PostMeta = (props, { post, toggleComments, dispatch, postDisplayMode }) => {
  const now = new Date()
  const createdAt = new Date(post.created_at)
  const updatedAt = new Date(post.updated_at)
  const shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8
  let project = postDisplayMode !== 'project' && get(post, 'projects.0')
  let vote = () => dispatch(voteOnPost(post))

  return <div className='meta'>
    <A to={`/p/${post.id}`}>{nonbreaking(humanDate(createdAt))}</A>
    {project && <span>
      &nbsp;for <A to={projectUrl(project)}>"{truncate(project.title, 60)}"</A>
    </span>}
    {shouldShowUpdatedAt && <span>
      {spacer}updated&nbsp;{nonbreaking(humanDate(updatedAt))}
    </span>}
    {spacer}
    <a onClick={vote} className='vote'>
      {post.votes}&nbsp;
      <i className={`icon-heart-new${post.myVote ? '-selected' : ''}`}></i>
    </a>
    {spacer}
    <a onClick={toggleComments} href='#'>
      {post.numComments}&nbsp;comment{post.numComments === 1 ? '' : 's'}
    </a>
    {post.public && <span>
      {spacer}Public
      {spacer}<SharingDropdown className='share-post' toggleChildren={<span>Share</span>} alignRight={true} url={`/p/${post.id}`} text={post.name} />
    </span>}
  </div>
}

PostMeta.contextTypes = Post.childContextTypes

const PostDetails = (props, { post, toggleComments, currentUser, dispatch }) => {
  let { comments, showingComments, commentingDisabled, communities } = props

  let image = find(post.media, m => m.type === 'image')
  let description = present(sanitize(post.description))
  let attachments = filter(post.media, m => m.type !== 'image')

  return <div className='post-details'>
    {image && <img src={image.url} className='full-image post-section'/>}

    {description && <ClickCatchingDiv className='details post-section'
      dangerouslySetInnerHTML={{__html: description}}/>}

    {post.type === 'event' && <EventRSVP postId={post.id} responders={post.responders}/>}
    <Followers post={post} currentUser={currentUser} />

    {!isEmpty(attachments) && <div className='post-section'>
      {attachments.map((file, i) =>
        <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
          <img src={file.thumbnail_url}/>
          {truncate(file.name, 40)}
        </a>)}
    </div>}

    <CommunityTags post={post} communities={communities}/>

    <CommentSection expanded={showingComments}
      {...{post, comments, commentingDisabled}}/>
  </div>
}

PostDetails.contextTypes = Post.childContextTypes

const CommunityTags = ({ post, communities }) =>
  <ul className='tags'>
    <li className={cx('tag', 'post-type', post.type)}>{post.type}</li>
    {communities.map(c => <li key={c.id} className='tag'>
      <Link to={`/c/${c.slug}`}>{c.name}</Link>
    </li>)}
  </ul>

const CommentSection = (props, { toggleComments, post }) => {
  let { comments, commentingDisabled, expanded } = props
  let count = Math.max(comments.length, post.numComments || 0)
  return <div className='comments-section'>
    {expanded
      ? (comments || []).map(c =>
          <Comment comment={{...c, post_id: post.id}} key={c.id}/>)
      : count > 0 &&
          <a onClick={toggleComments}>Show {count} comments</a>}
    {!commentingDisabled && <CommentForm postId={post.id}/>}
  </div>
}

CommentSection.contextTypes = {post: object, toggleComments: func}

const EventRSVP = ({ postId, responders }, { currentUser, dispatch }) => {
  let isCurrentUser = r => r.id === get(currentUser, 'id')
  let currentResponse = get(find(responders, isCurrentUser), 'response') || ''
  let onPickResponse = currentUser &&
    (choice => dispatch(changeEventResponse(postId, choice, currentUser)))

  return <RSVPControl {...{responders, currentResponse, onPickResponse}}/>
}

EventRSVP.contextTypes = {currentUser: object, dispatch: func}

const Followers = (props, { post, currentUser }) => {
  let { followers } = post

  let onlyAuthorIsFollowing = followers.length === 1 && first(followers).id === post.user.id
  let meInFollowers = (currentUser && find(followers, {id: currentUser.id}))
  let otherFollowers = meInFollowers ? without(followers, meInFollowers) : followers

  let numShown = 2
  let num = otherFollowers.length
  let hasHidden = num > numShown
  let separator = threshold => num > threshold ? ', ' : (num === threshold ? ' and ' : '')

  if (followers.length > 0 && !onlyAuthorIsFollowing) {
    return <div className='meta followers'>
      {meInFollowers && <span>
        You{separator(1)}
      </span>}
      {otherFollowers.slice(0, numShown).map((person, index) => {
        let last = index === numShown - 1
        return <span key={person.id}>
          <a href={`/u/${person.id}`}>
            {person.name}
          </a>
          {!last && separator(2)}
        </span>
      })}
      {hasHidden && ' and '}
      {hasHidden && <Dropdown className='followers-dropdown'
        toggleChildren={<span>
          {num - numShown} other{num - numShown > 1 ? 's' : ''}
        </span>}>
        {otherFollowers.slice(numShown).map(f => <li key={f.id}>
          <div>
            <Avatar person={f}/>
            <Link to={`/u/${f.id}`}>{f.name}</Link>
          </div>
        </li>)}
      </Dropdown>}
      &nbsp;{meInFollowers || num > 1 ? 'are' : 'is'} following this.

    </div>
  } else {
    return <span />
  }
}

Followers.contextTypes = {post: object, currentUser: object}

import React from 'react'
import { Link } from 'react-router'
import { filter, find, first, get, isEmpty, map, pick, some, without } from 'lodash'
import { projectUrl } from '../routes'
const { array, bool, func, object, string } = React.PropTypes
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
import PersonDropdownItem from './PersonDropdownItem'
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
import { fetchPeople } from '../actions/fetchPeople'
import { same } from '../models'
import decode from 'ent/decode'
import { scrollToAnchor } from '../util/scrolling'

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
    currentUser: object,
    voters: array
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
      Promise.resolve(commentsLoaded || this.props.dispatch(fetchComments(post.id)))
      .then(() => scrollToAnchor(`post-${post.id}-comments`))
      trackEvent(SHOWED_POST_COMMENTS, {post})
    }
    this.setState({showingComments: !this.state.showingComments})
  }

  render () {
    let { post, communities, comments, commentingDisabled, expanded, voters } = this.props
    let { showingComments } = this.state

    let image = find(post.media, m => m.type === 'image')
    var classes = cx('post', post.type, {expanded: expanded, image: !!image})

    let style = image ? {backgroundImage: `url(${image.url})`} : {}
    let title = decode(post.name || '')
    let person = post.type === 'welcome'
      ? post.relatedUsers[0]
      : post.user

    let isEvent = post.type === 'event'
    if (isEvent) {
      let start = new Date(post.start_time)
      let end = post.end_time && new Date(post.end_time)
      var eventTime = timeRange(start, end)
      var eventTimeFull = timeRangeFull(start, end)
    }

    return <div className={classes} onClick={this.expand}>
      <div className='header'>
        {expanded && <CaretMenu/>}
        <Avatar person={person}/>
        {post.type === 'welcome'
          ? <WelcomePostHeader communities={communities}/>
          : <span>
              <A className='name' to={`/u/${person.id}`}>{person.name}</A>
            </span>}
        <PostMeta voters={voters}/>
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

      {expanded && <PostDetails
        {...{comments, showingComments, communities, commentingDisabled}}/>}
    </div>
  }
}

export default connect((state, { post }) => {
  let { comments, commentsByPost, people, peopleByQuery, communities } = state
  let commentIds = get(commentsByPost, post.id)
  return {
    commentsLoaded: !!commentIds,
    comments: map(commentIds, id => comments[id]),
    currentUser: get(people, 'current'),
    communities: map(post.communities, id => find(communities, same('id', {id}))),
    voters: map(get(peopleByQuery, `subject=voters&id=${post.id}`), id => people[id])
  }
})(Post)

export const UndecoratedPost = Post // for testing

const WelcomePostHeader = ({ communities }, { post, toggleComments }) => {
  let person = post.relatedUsers[0]
  let community = communities[0]
  return <span>
    <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined&ensp;
    {community
      ? <span>
          <A to={`/c/${community.slug}`}>{community.name}</A>.&ensp;
          <a className='open-comments' onClick={toggleComments}>
            Welcome them!
          </a>
        </span>
      : <span>
          a community that is no longer active.
        </span>}
  </span>
}

WelcomePostHeader.contextTypes = {post: object, toggleComments: func}

const CaretMenu = (props, { dispatch, post, currentUser }) => {
  let canEdit = same('id', currentUser, post.user)
  let following = some(post.followers, same('id', currentUser))

  const edit = () => dispatch(startPostEdit(post))
  const remove = () => window.confirm('Are you sure? This cannot be undone.') &&
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

CaretMenu.contextTypes = {dispatch: func, post: object, currentUser: object}

const PostMeta = ({ voters }, { post, toggleComments, dispatch, postDisplayMode }) => {
  const now = new Date()
  const createdAt = new Date(post.created_at)
  const updatedAt = new Date(post.updated_at)
  const shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8
  if (!voters) voters = []
  let project = postDisplayMode !== 'project' && get(post, 'projects.0')
  let vote = () => dispatch(voteOnPost(post))
  let fetchVoters = () => dispatch(fetchPeople({subject: 'voters', id: post.id}))

  return <div className='meta'>
    <A to={`/p/${post.id}`}>{nonbreaking(humanDate(createdAt))}</A>
    {project && <span>
      &nbsp;for <A to={projectUrl(project)}>"{truncate(project.title, 60)}"</A>
    </span>}
    {shouldShowUpdatedAt && <span>
      {spacer}updated&nbsp;{nonbreaking(humanDate(updatedAt))}
    </span>}
    {spacer}
    {post.votes === 0
      ? '0'
      : <Dropdown className='inline'
          onFirstOpen={fetchVoters}
          toggleChildren={<span>{post.votes}</span>}>
          {voters.map(p => <PersonDropdownItem key={p.id} person={p}/>)}
        </Dropdown>}
    <a onClick={vote} className='vote'>
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

PostMeta.contextTypes = {...Post.childContextTypes, postDisplayMode: string}

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

    <PostTags post={post} communities={communities}/>

    <CommentSection expanded={showingComments}
      {...{post, comments, commentingDisabled}}/>
  </div>
}

PostDetails.contextTypes = Post.childContextTypes

const PostTags = ({ post, communities }) =>
  <ul className='tags'>
    <li className={cx('tag', 'post-type', post.type)}>{post.type}</li>
    {(communities || []).map(c => <li key={c.id} className='tag'>
      <Link to={`/c/${c.slug}`}>{c.name}</Link>
    </li>)}
  </ul>

const CommentSection = (props, { toggleComments, post }) => {
  let { comments, commentingDisabled, expanded } = props
  if (!comments) comments = []
  let count = Math.max(comments.length, post.numComments || 0)
  return <div className='comments-section'>
    <a name={`post-${post.id}-comments`}></a>
    {expanded
      ? comments.map(c =>
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
  let { followers, length } = post
  if (!followers) followers = []

  let onlyAuthorIsFollowing = length === 1 && same('id', first(followers), post.user)
  let meInFollowers = find(followers, same('id', currentUser))
  let otherFollowers = meInFollowers ? without(followers, meInFollowers) : followers

  let numShown = 2
  let num = otherFollowers.length
  let hasHidden = num > numShown
  let separator = threshold =>
    num > threshold ? ', ' : (num === threshold ? ' and ' : '')

  if (followers.length > 0 && !onlyAuthorIsFollowing) {
    return <div className='meta followers'>
      {meInFollowers && <span>You{separator(1)}</span>}
      {otherFollowers.slice(0, numShown).map((person, index) =>
        <span key={person.id}>
          <a href={`/u/${person.id}`}>{person.name}</a>
          {index !== numShown - 1 && separator(2)}
        </span>)}
      {hasHidden && ' and '}
      {hasHidden && <Dropdown className='inline'
        toggleChildren={<span>
          {num - numShown} other{num - numShown > 1 ? 's' : ''}
        </span>}>
        {otherFollowers.slice(numShown).map(p =>
          <PersonDropdownItem key={p.id} person={p}/>)}
      </Dropdown>}
      &nbsp;{meInFollowers || num > 1 ? 'are' : 'is'} following this.

    </div>
  } else {
    return <span />
  }
}

Followers.contextTypes = {post: object, currentUser: object}

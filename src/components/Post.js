import React from 'react'
import { Link } from 'react-router'
import { filter, find, get, isEmpty, findWhere, first, without } from 'lodash'
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
import PostEditor from './PostEditor'
import RSVPControl from './RSVPControl'
import SharingDropdown from './SharingDropdown'
import { connect } from 'react-redux'
import { fetchComments, createComment, startPostEdit, changeEventResponse, voteOnPost } from '../actions'

const spacer = <span>&nbsp; •&nbsp; </span>

@connect(({ comments, commentsByPost, people, postEdits, communities }, { post }) => ({
  comments: commentsByPost[post.id] ? commentsByPost[post.id].map(id => comments[id]) : null,
  currentUser: people.current,
  editing: !!postEdits[post.id],
  communities: post.communities.map(id => find(communities, c => c.id === id))
}))
export default class Post extends React.Component {
  static propTypes = {
    post: object,
    onExpand: func,
    expanded: bool,
    commentsExpanded: bool,
    communities: array,
    comments: array,
    dispatch: func,
    commentingDisabled: bool,
    currentUser: object,
    editing: bool
  }

  static contextTypes = {
    postDisplayMode: string
  }

  constructor (props) {
    super(props)
    this.state = {commentsExpanded: props.commentsExpanded}
  }

  expand = () => {
    let {expanded, onExpand, post} = this.props
    if (!expanded) onExpand(post.id)
  }

  toggleComments = event => {
    event.stopPropagation()
    event.preventDefault()
    this.expand()

    let { post, comments } = this.props
    if (!comments) this.props.dispatch(fetchComments(post.id))
    this.setState({commentsExpanded: !this.state.commentsExpanded})
  }

  vote = () => {
    let { dispatch, post } = this.props
    dispatch(voteOnPost(post))
  }

  edit = () => {
    let { dispatch, post } = this.props
    dispatch(startPostEdit(post))
  }

  render () {
    let { post, expanded, currentUser, editing } = this.props
    if (editing) return this.renderEdit()
    if (post.type === 'welcome') return this.renderWelcome()

    let image = find(post.media, m => m.type === 'image')
    var style = image ? {backgroundImage: `url(${image.url})`} : {}
    var classes = cx('post', post.type, {expanded: expanded, image: !!image})

    let title = post.name
    let person = post.user

    let isEvent = post.type === 'event'
    if (isEvent) {
      let start = new Date(post.start_time)
      let end = post.end_time && new Date(post.end_time)
      var eventTime = timeRange(start, end)
      var eventTimeFull = timeRangeFull(start, end)
    }

    let canEdit = (currentUser && currentUser.id === person.id)

    return <div className={classes} onClick={this.expand}>
      <div className='header'>
        <Avatar person={person}/>

        {expanded && <Dropdown className='post-menu' alignRight={true} toggleChildren={
            <i className='icon-down'></i>
          }>
            {canEdit && <li><a onClick={this.edit}>Edit</a></li>}
            <li>
              <a onClick={() => window.alert('TODO')}>Report objectionable content</a>
            </li>
          </Dropdown>}

        <span className='name'>{person.name}</span>
        <PostMeta post={post} toggleComments={this.toggleComments} vote={this.vote}/>
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

      {image && <div className='image' style={style}></div>}
      {expanded && <ExpandedPostDetails
        onCommentCreate={text => this.props.dispatch(createComment(post.id, text))}
        commentsExpanded={this.state.commentsExpanded}
        {...{image}} {...this.props}/>}
    </div>
  }

  renderWelcome () {
    let { post, communities, expanded, dispatch } = this.props
    let person = post.relatedUsers[0]
    return <div className='post welcome'>
      <Avatar person={person}/>
      <div className='header'>
        <strong><A to={`/u/${person.id}`}>{person.name}</A></strong> joined {communities[0].name}.&ensp;
        <a className='open-comments' onClick={this.toggleComments}>Welcome them!</a>
        <PostMeta post={post} toggleComments={this.toggleComments}/>
      </div>
      {expanded && <ExpandedPostDetails
        onCommentCreate={text => dispatch(createComment(post.id, text))}
        commentsExpanded={this.state.commentsExpanded}
        {...this.props}/>}
    </div>
  }

  renderEdit () {
    let { post } = this.props
    return <PostEditor post={post} expanded={true}/>
  }
}

const PostMeta = ({ post, toggleComments, vote }, { postDisplayMode }) => {
  const now = new Date()
  const createdAt = new Date(post.created_at)
  const updatedAt = new Date(post.updated_at)
  const shouldShowUpdatedAt = (now - updatedAt) < (now - createdAt) * 0.8
  let project = postDisplayMode !== 'project' && get(post, 'projects.0')

  return <div className='meta'>
    <A to={`/p/${post.id}`}>{nonbreaking(humanDate(createdAt))}</A>
    {project && <span>
      &nbsp;for <A to={projectUrl(project)}>"{truncate(project.title, 60)}"</A>
    </span>}
    {shouldShowUpdatedAt && <span>
      {spacer}updated&nbsp;{nonbreaking(humanDate(updatedAt))}
    </span>}
    {spacer}
    <a onClick={vote} className='vote'>{post.votes}&nbsp;<i className={post.myVote ? 'icon-heart-new-selected' : 'icon-heart-new'}></i></a>
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

const ExpandedPostDetails = props => {
  let {
    post, image, comments, commentsExpanded, currentUser, dispatch,
    commentingDisabled, onCommentCreate, communities
  } = props
  let description = present(sanitize(post.description))
  let attachments = filter(post.media, m => m.type !== 'image')

  if (!comments) comments = []

  return <div className='post-details'>
    {image && <img src={image.url} className='full-image post-section'/>}

    {description && <ClickCatchingDiv className='details post-section'
      dangerouslySetInnerHTML={{__html: description}}/>}

    {post.type === 'event' && <RSVPControl
      responders={post.responders}
      currentResponse={(find(post.responders, responder => responder.id === currentUser.id) || {response: ''}).response}
      onPickResponse={choice => dispatch(changeEventResponse(post.id, choice, currentUser))} />}

    <Followers post={post} currentUser={currentUser} />

    {!isEmpty(attachments) && <div className='post-section'>
      {attachments.map((file, i) =>
        <a key={i} className='attachment' href={file.url} target='_blank' title={file.name}>
          <img src={file.thumbnail_url}/>
          {truncate(file.name, 40)}
        </a>)}
    </div>}

    <div className='meta'>
      <ul className='tags'>
        <li className={cx('tag', 'post-type', post.type)}>{post.type}</li>
        {communities.map(c => <li key={c.id} className='tag'>
          <Link to={`/c/${c.slug}`} key={c.id}>{c.name}</Link>
        </li>)}
      </ul>
    </div>

    {commentsExpanded && <div className='comments-section'>
      {comments.map(c => <Comment comment={c} key={c.id}/>)}
      {!commentingDisabled && <CommentForm onCreate={onCommentCreate}/>}
    </div>}
  </div>
}

const Followers = props => {
  let { post, currentUser } = props
  let { followers } = post

  let onlyAuthorIsFollowing = followers.length === 1 && first(followers).id === post.user.id
  let meInFollowers = (currentUser && findWhere(followers, {id: currentUser.id}))
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
        return <a key={person.id} href={`/u/${person.id}`}>
          {person.name}
          {!last && separator(2)}
        </a>
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

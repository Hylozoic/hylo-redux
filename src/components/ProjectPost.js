import React from 'react'
import { connect } from 'react-redux'
import { Header, presentDescription } from './Post'
import CommentSection from './CommentSection'
import decode from 'ent/decode'
import { textLength, truncate } from '../util/text'
import { isEmpty } from 'lodash'
import { find, some } from 'lodash/fp'
import { same } from '../models'
import { denormalizedPost, getComments, getPost, imageUrl } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import Icon from './Icon'
import Post from './Post'
import Video from './Video'
import LazyLoader from './LazyLoader'
import Avatar from './Avatar'
import LinkedPersonSentence from './LinkedPersonSentence'
import A from './A'
import { ClickCatchingSpan } from './ClickCatcher'
import { navigate } from '../actions'
import { fetchPost, followPost } from '../actions/posts'
import moment from 'moment'
const { array, bool, func, object } = React.PropTypes

const Deadline = ({ time }) => {
  const then = moment(time)
  const now = moment()
  const classes = ['deadline']
  if (then.diff(now, 'days') < 10) classes.push('soon')
  return <span className={classes.join(' ')} title={then.format('LLLL')}>
    {moment(time).toNow(true)} to go
  </span>
}

const ProjectPost = (props, context) => {
  const { post, community, comments, communities } = context
  const { tag, media, location, user } = post
  const title = decode(post.name || '')
  const video = find(m => m.type === 'video', media)
  const image = find(m => m.type === 'image', media)
  const description = presentDescription(post, community)
  const requests = post.children || []

  return <div className='post project boxy-post'>
    <Header communities={communities}/>
    <p className='title post-section'>{title}</p>
    {tag && <p className='hashtag'>#{tag}</p>}
    <div className='box'>
      {video
        ? <div className='video-wrapper'><Video url={video.url}/></div>
        : image && <div className='image'><img src={image.url}/></div>}
      <div className='row'>
        <div className='main-col'>
          {location && <div className='meta location'>
            <Icon name='Pin-1'/>
            <span title={location}>{location}</span>
          </div>}
          {description && <div className='details'>
            <h3>Description</h3>
            <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}}/>
          </div>}
          <div className='leads'>
            <h3>Project leads</h3>
            <Avatar person={user}/>
            <div className='person-info'>
              <A className='name' to={`/u/${user.id}`}>{user.name}</A>
              <p>{user.bio}</p>
            </div>
          </div>
        </div>
        <Supporters post={post}/>
      </div>
    </div>
    {requests.length > 0 && <div className='requests'>
      <h3>
        {requests.length} request{requests.length === 1 ? '' : 's'}&nbsp;
        <span className='soft'>to make this happen</span>
      </h3>
      {requests.map(id => <ProjectRequest key={id} {...{id, community}}/>)}
    </div>}
    <CommentSection post={post} comments={comments} expanded/>
  </div>
}
ProjectPost.contextTypes = {
  community: object,
  communities: array,
  post: object,
  comments: array
}

export default ProjectPost

const Supporters = ({ post, simple }, { currentUser, dispatch }) => {
  const { followers, end_time } = post
  const isFollowing = some(same('id', currentUser), followers)
  const follow = () => dispatch(followPost(post.id, currentUser))

  return <div className='supporters'>
    {!simple && <div className='top'>
      <h3>
        {followers.length} supporter{followers.length === 1 ? '' : 's'}
      </h3>
      {end_time && <Deadline time={end_time}/>}
    </div>}
    {!isEmpty(followers) && <LinkedPersonSentence people={followers} className='blurb meta'>
      support{followers.length > 1 || some(same('id', currentUser), followers) ? '' : 's'}
      <span>&nbsp;this.</span>
    </LinkedPersonSentence>}
    <div className='avatar-list'>
      {followers.map(person => <Avatar person={person} key={person.id}/>)}
    </div>
    {!simple && <a className='support button has-icon' onClick={follow}>
      <Icon name={isFollowing ? 'ok-sign' : 'plus-sign'} glyphicon/>
      {isFollowing ? 'Supporting' : 'Support this'}
    </a>}
  </div>
}
Supporters.contextTypes = {currentUser: object, dispatch: func}

@connect((state, { id }) => ({
  post: getPost(id, state)
}))
class ProjectRequest extends React.Component {
  static propTypes = {
    post: object.isRequired,
    community: object
  }

  static contextTypes = {
    dispatch: func,
    isMobile: bool
  }

  static childContextTypes = {
    isProjectRequest: bool
  }

  getChildContext () {
    return {isProjectRequest: true}
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { dispatch, isMobile } = this.context
    const { post, community } = this.props
    const { name, id, numComments } = post
    let description = presentDescription(post, community)
    const truncated = textLength(description) > 200
    if (truncated) {
      description = truncate(description, 200)
    }

    const zoom = () => {
      if (isMobile) {
        dispatch(navigate(`/p/${post.id}`))
      } else {
        this.setState({zoomed: true})
        dispatch(fetchPost(id))
      }
    }
    const unzoom = () => this.setState({zoomed: false})

    return <div className='nested-request'>
      {this.state.zoomed && <div className='zoomed'>
        <div className='backdrop' onClick={unzoom}/>
        {post.user && <Post post={post} expanded/>}
      </div>}
      <p className='title'>{name}</p>
      {description && <ClickCatchingSpan className='details'
        dangerouslySetInnerHTML={{__html: description}}/>}
      {truncated && <span>
        <A to={`/p/${id}`} className='show-more'>Show&nbsp;more</A>
      </span>}
      <div className='meta'>
        <a className='help button has-icon' onClick={zoom}>
          <Icon name='plus-sign' glyphicon/>
          Offer to help
        </a>
        {numComments > 0 && <a onClick={zoom}>
          {numComments} comment{numComments === 1 ? '' : 's'}
        </a>}
      </div>
    </div>
  }
}

const spacer = <span>&nbsp; •&nbsp; </span>

export const ProjectPostCard = connect(
  (state, { post }) => ({
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    isMobile: state.isMobile,
    post: denormalizedPost(post, state)
  })
)(({ post, community, comments, dispatch, isMobile }) => {
  const { name, user, tag, end_time, id } = post
  const url = `/p/${post.id}`
  const backgroundImage = `url(${imageUrl(post)})`

  let description = presentDescription(post, community)
  const truncated = textLength(description) > 140
  if (truncated) {
    description = truncate(description, 140)
  }

  return <div className='post project-summary'>
    <LazyLoader className='image'>
      <A to={url} style={{backgroundImage}}/>
    </LazyLoader>
    <div className='meta'>
      {end_time && <span>
        <Deadline time={end_time}/>
        {spacer}
      </span>}
      {tag && <span className='hashtag-segment'>
        <A className='hashtag' to={url}>#{tag}</A>
        {spacer}
      </span>}
      <A to={`/u/${user.id}`}>{user.name}</A>
    </div>
    <A className='title' to={url}>{name}</A>
    {!isMobile && description && <div className='details-row'>
      <ClickCatchingSpan className='details'
        dangerouslySetInnerHTML={{__html: description}}/>
      {truncated && <span>
        <A to={`/p/${id}`} className='show-more'>Show&nbsp;more</A>
      </span>}
    </div>}
    <Supporters post={post} simple/>
    <div className='comments-section-spacer'/>
    <CommentSection post={post} comments={comments}
      onExpand={() => dispatch(navigate(url))}/>
  </div>
})

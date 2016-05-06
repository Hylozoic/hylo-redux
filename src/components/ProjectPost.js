import React from 'react'
import { connect } from 'react-redux'
import { Header, CommentSection, presentDescription } from './Post'
import decode from 'ent/decode'
import truncate from 'html-truncate'
import { textLength } from '../util/text'
import { isEmpty } from 'lodash'
import { find, some } from 'lodash/fp'
import { same } from '../models'
import { getPost } from '../models/post'
import Icon from './Icon'
import Post from './Post'
import Video from './Video'
import Avatar from './Avatar'
import LinkedPersonSentence from './LinkedPersonSentence'
import A from './A'
import { ClickCatchingSpan } from './ClickCatcher'
import { fetchPost, followPost } from '../actions'
const { array, bool, func, object } = React.PropTypes

const ProjectPost = (props, context) => {
  const { post, community, comments, communities, currentUser, dispatch } = context
  const { tag, media, location, user, followers } = post
  const title = decode(post.name || '')
  const video = find(m => m.type === 'video', media)
  const image = find(m => m.type === 'image', media)
  const description = presentDescription(post, community)
  const requests = post.children
  const isFollowing = some(same('id', currentUser), followers)
  const follow = () => dispatch(followPost(post.id, currentUser))

  return <div className='post project boxy-post'>
    <Header communities={communities}/>
    <p className='title post-section'>{title}</p>
    {tag && <p className='hashtag'>#{tag}</p>}
    <div className='box'>
      {video
        ? <div className='video-wrapper'><Video url={video.url}/></div>
        : image && <div className='image'><img src={image}/></div>}
      <div className='row'>
        <div className='main-col'>
          {location && <div className='meta location'>
            <Icon name='map-marker'/>
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
        <div className='supporters'>
          <h3>{followers.length} supporters</h3>
          <div className='avatar-list'>
            {followers.map(person => <Avatar person={person} key={person.id}/>)}
          </div>
          {!isEmpty(followers) && <LinkedPersonSentence people={followers} className='blurb meta'>
            support{followers.length > 1 || some(same('id', currentUser), followers) ? '' : 's'}
            <span>&nbsp;this.</span>
          </LinkedPersonSentence>}
          <a className='support button has-icon' onClick={follow}>
            <Icon name={isFollowing ? 'ok-sign' : 'plus-sign'}/>
            {isFollowing ? 'Supporting' : 'Support this'}
          </a>
        </div>
      </div>
    </div>
    <div className='requests'>
      <h3>
        {requests.length} requests&nbsp;
        <span className='soft'>to make this happen</span>
      </h3>
      {requests.map(id => <ProjectRequest key={id} {...{id, community}}/>)}
    </div>
    <CommentSection comments={comments}/>
  </div>
}

ProjectPost.contextTypes = {
  community: object,
  communities: array,
  post: object,
  comments: array,
  currentUser: object,
  dispatch: func
}

export default ProjectPost

@connect((state, { id }) => ({
  post: getPost(id, state)
}))
class ProjectRequest extends React.Component {
  static propTypes = {
    post: object.isRequired,
    community: object
  }

  static contextTypes = {
    dispatch: func
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
    const { dispatch } = this.context
    const { post, community } = this.props
    const { name, id, numComments } = post
    let description = presentDescription(post, community)
    const truncated = textLength(description) > 200
    if (truncated) description = truncate(description, 200)

    const zoom = () => {
      this.setState({zoomed: true})
      dispatch(fetchPost(id))
    }
    const unzoom = () => this.setState({zoomed: false})

    return <div className='nested-request'>
      {this.state.zoomed && <div className='zoomed'>
        <div className='backdrop' onClick={unzoom}/>
        {post.user && <Post post={post} expanded={true}/>}
      </div>}
      <p className='title'>{name}</p>
      {description && <ClickCatchingSpan className='details'
        dangerouslySetInnerHTML={{__html: description}}/>}
      {truncated && <span>
        <A to={`/p/${id}`}>Show&nbsp;more</A>
      </span>}
      <div className='meta'>
        <a className='help button has-icon' onClick={zoom}>
          <Icon name='plus-sign'/>
          Offer to help
        </a>
        <a onClick={zoom}>
          Comments
          {numComments > 0 && ` (${numComments})`}
        </a>
      </div>
    </div>
  }
}

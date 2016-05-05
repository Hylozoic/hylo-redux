import React from 'react'
import { Header, CommentSection, presentDescription } from './Post'
import decode from 'ent/decode'
import truncate from 'html-truncate'
import { textLength } from '../util/text'
import { isEmpty } from 'lodash'
import { find, some } from 'lodash/fp'
import { same } from '../models'
import Icon from './Icon'
import Video from './Video'
import Avatar from './Avatar'
import LinkedPersonSentence from './LinkedPersonSentence'
import A from './A'
import { ClickCatchingSpan } from './ClickCatcher'
const { array, object } = React.PropTypes

export default class ProjectPost extends React.Component {
  static contextTypes = {
    community: object,
    communities: array,
    post: object,
    comments: array,
    currentUser: object
  }

  render () {
    const { post, community, comments, communities, currentUser } = this.context
    const { tag, media, location, user, followers } = post
    const title = decode(post.name || '')
    const video = find(m => m.type === 'video', media)
    const image = find(m => m.type === 'image', media)
    const description = presentDescription(post, community)
    const requests = post.children

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
          <div className='side-col'>
            <h3>{followers.length} supporters</h3>
            <div className='avatar-list'>
              {followers.slice(0, 5).map(person => <Avatar person={person} key={person.id}/>)}
            </div>
            {!isEmpty(followers) && <LinkedPersonSentence people={followers} className='blurb meta'>
              support{followers.length > 1 || some(same('id', currentUser), followers) ? '' : 's'}
              <span>&nbsp;this.</span>
            </LinkedPersonSentence>}
          </div>
        </div>
      </div>
      <div className='requests'>
        <h3>
          {requests.length} requests&nbsp;
          <span className='soft'>to make this happen</span>
        </h3>
        {requests.map(r => <ProjectRequest post={r} community={community}
          key={r.id}/>)}
      </div>
      <CommentSection comments={comments}/>
    </div>
  }
}

export default ProjectPost

const ProjectRequest = ({ post, community }) => {
  let { name, description, id, num_comments } = post
  description = presentDescription(post, community)
  const truncated = textLength(description) > 200
  if (truncated) description = truncate(description, 200)

  return <div className='request'>
    <p className='title'>{name}</p>
    {description && <ClickCatchingSpan className='details'
      dangerouslySetInnerHTML={{__html: description}}/>}
    {truncated && <span>
      <A to={`/p/${id}`}>Show&nbsp;more</A>
    </span>}
    <div className='meta'>
      <a className='help button'>Help with this</a>
      <A to={`/p/${id}`}>
        Comments
        {num_comments > 0 && ` (${num_comments})`}
      </A>
    </div>
  </div>
}

import React from 'react'
import Post from './Post'
import A from './A'
import { imageUrl } from '../models/post'
import { humanDate } from '../util/text'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const ProjectActivityCard = ({ expanded, onExpand, post, parentPost }, { isMobile }) => {
  const backgroundImage = `url(${imageUrl(parentPost)})`
  const url = `/p/${parentPost.id}`

  return <div className='project-activity-card'>
    <div className='project-banner'>
      <A className='image' to={url} style={{backgroundImage}} />
      <span className='name'>{parentPost.name}</span>
      <span className='spacer'>{spacer}</span>
      <span className='date'>{humanDate(parentPost.created_at)}</span>
      {!isMobile && <A className='orange-button' to={url}>See all requests</A>}
    </div>
    <Post {...{post, parentPost, onExpand, expanded}} inActivityCard />
  </div>
}
ProjectActivityCard.contextTypes = {isMobile: React.PropTypes.bool}

export default ProjectActivityCard

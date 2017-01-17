import React from 'react'
import Post from './Post'
import A from './A'
import { imageUrl } from '../models/post'
import { humanDate } from '../util/text'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const ProjectActivityCard = ({ onExpand, post }, context) => {
  const { project } = post
  const backgroundImage = `url(${imageUrl(project)})`
  const url = `/p/${project.id}`

  return <div className='project-activity-card'>
    <div className='project-banner'>
      <A className='image' to={url} style={{backgroundImage}} />
      <span className='name'>{project.name}</span>
      <span className='spacer'>{spacer}</span>
      <span className='date'>{humanDate(project.created_at)}</span>
      <A className='orange-button' to={url}>See all requests</A>
    </div>
    <Post post={post} onExpand={onExpand} />
  </div>
}

export default ProjectActivityCard

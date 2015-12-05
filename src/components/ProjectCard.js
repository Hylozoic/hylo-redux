import React from 'react'
import { humanDate } from '../util/text'
import Avatar from '../components/Avatar'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const ProjectCard = props => {
  let { project } = props
  let image = project.image_url || project.thumbnail_url
  let person = project.user
  let { contributor_count, open_request_count, created_at, title, intention } = project

  return <div className='project-card'>
    {image && <div className='image' style={{backgroundImage: `url(${image})`}}></div>}
    <div className='content'>
      <h4>{title}</h4>
      <p>{intention}</p>
      <Avatar person={person}/>
      <span className='name'>{person.name}</span>
      <div className='meta'>
        {humanDate(created_at)}
      </div>
    </div>
    <div className='meta footer'>
      {contributor_count} contributor{contributor_count !== 1 && 's'}
      {spacer}
      {open_request_count} request{open_request_count !== 1 && 's'}
    </div>
  </div>
}

export default ProjectCard

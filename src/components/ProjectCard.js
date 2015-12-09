import React from 'react'
import { humanDate } from '../util/text'
import { find, pluck } from 'lodash'
import Avatar from '../components/Avatar'
import A from '../components/A'

const spacer = <span>&nbsp;&nbsp;•&nbsp;&nbsp;</span>

const ProjectCard = props => {
  let { project } = props
  let image = find(pluck(project.media, 'thumbnail_url')) || find(pluck(project.media, 'url'))
  let person = project.user
  let { contributor_count, open_request_count, created_at, title, intention } = project
  let projectUrl = `/project/${project.id}/${project.slug}`
  let isDraft = !project.published_at

  return <div className='project-card'>
    {image && <A to={projectUrl} className='image' style={{backgroundImage: `url(${image})`}}/>}
    <div className='content'>
      <h4><A to={projectUrl}>{title}</A></h4>
      <p>{intention}</p>
      <Avatar person={person}/>
      <A className='name' to={`/u/${person.id}`}>{person.name}</A>
      <div className='meta'>
        {humanDate(created_at)}
      </div>
    </div>
    <div className='meta footer'>
      {contributor_count} contributor{contributor_count !== 1 && 's'}
      {spacer}
      {open_request_count} request{open_request_count !== 1 && 's'}
      {isDraft && <span>{spacer}Draft</span>}
    </div>
  </div>
}

export default ProjectCard

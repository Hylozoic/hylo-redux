import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { compose } from 'redux'
import { fetchProjects } from '../actions/fetchProjects'
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

const Projects = props => {
  return <div>
    <h2>Projects</h2>
    <div className='project-card-container'>
      {props.projects.map(p => <div className='project-card-wrapper' key={p.id}>
        <ProjectCard project={p}/>
      </div>)}
    </div>
  </div>
}

const cacheId = 'all'

export default compose(
  prefetch(({ dispatch }) => {
    return dispatch(fetchProjects({subject: 'all', cacheId}))
  }),
  connect(({ projectsByQuery, projects }) => ({
    projects: (projectsByQuery[cacheId] || []).map(id => projects[id])
  }))
)(Projects)

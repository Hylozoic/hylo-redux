import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { FETCH_PROJECTS } from '../actions'
import { fetchProjects } from '../actions/fetchProjects'
import { humanDate } from '../util/text'
import Avatar from '../components/Avatar'
const Masonry = require('../components/Masonry')(React)
const { array, bool, func, number } = React.PropTypes
import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'

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

const subject = 'all'
const cacheId = 'all'

@prefetch(({ dispatch }) => {
  return dispatch(fetchProjects({subject, cacheId}))
})
@connect(({ projectsByQuery, totalProjectsByQuery, projects, pending }) => ({
  projects: (projectsByQuery[cacheId] || []).map(id => projects[id]),
  total: totalProjectsByQuery[cacheId],
  pending: pending[FETCH_PROJECTS]
}))
export default class Projects extends React.Component {
  static propTypes = {
    projects: array,
    dispatch: func,
    total: number,
    pending: bool
  }

  handleScrollEvents = throttle(event => {
    event.preventDefault()
    let { dispatch, projects, pending, total } = this.props
    let offset = projects.length
    if (isAtBottom(250) && !pending && offset < total) {
      dispatch(fetchProjects({subject, offset, cacheId}))
    }
  }, 50)

  componentDidMount () {
    window.addEventListener('scroll', this.handleScrollEvents)
  }

  componentWillUnmount () {
    window.removeEventListener('scroll', this.handleScrollEvents)
  }

  render () {
    let { projects } = this.props
    return <div>
      <h2>Projects</h2>
      <div className='project-card-container'>
        <Masonry options={{transitionDuration: 0}}>
          {projects.map(p => <div className='project-card-wrapper' key={p.id}>
            <ProjectCard project={p}/>
          </div>)}
        </Masonry>
      </div>
    </div>
  }
}

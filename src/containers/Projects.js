import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { FETCH_PROJECTS } from '../actions'
import { fetchProjects } from '../actions/fetchProjects'
import ProjectCardContainer from '../components/ProjectCardContainer'
const { array, bool, func, number } = React.PropTypes
import { throttle } from 'lodash'
import { isAtBottom } from '../util/scrolling'

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
      <ProjectCardContainer projects={projects}/>
    </div>
  }
}

import React from 'react'
import ProjectCardContainer from '../components/ProjectCardContainer'
import ScrollListener from '../components/ScrollListener'
import { connectedListProps, fetchWithCache } from '../util/caching'
import { fetchProjects } from '../actions/project'
import { connect } from 'react-redux'
import { isEmpty } from 'lodash'
const { array, bool, func, number, object, string } = React.PropTypes

export const fetch = fetchWithCache(fetchProjects)

@connect((state, props) => connectedListProps(state, props, 'projects'))
export class ConnectedProjectList extends React.Component {
  static propTypes = {
    subject: string.isRequired,
    id: string.isRequired,
    query: object,
    dispatch: func,
    projects: array,
    total: number,
    pending: bool
  }

  loadMore = () => {
    let { dispatch, projects, pending, total, subject, id, query } = this.props
    let offset = projects.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  render () {
    let { projects, pending } = this.props
    return <div>
      {!pending && isEmpty(projects) && <div>No projects.</div>}
      <ProjectCardContainer projects={projects}/>
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}

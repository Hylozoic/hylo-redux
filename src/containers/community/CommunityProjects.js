import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchProjects } from '../../actions/fetchProjects'
import ProjectCardContainer from '../../components/ProjectCardContainer'
import ScrollListener from '../../components/ScrollListener'
import { fetchWithCache, connectedListProps } from '../../util/caching'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'community'
const fetch = fetchWithCache(fetchProjects)

@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
@connect((state, { params: { id }, location: { query } }) => {
  return connectedListProps(state, {subject, id, query}, 'projects')
})
export default class CommunityProjects extends React.Component {
  static propTypes = {
    projects: array,
    dispatch: func,
    total: number,
    pending: bool,
    params: object,
    location: object
  }

  loadMore = () => {
    let { projects, dispatch, total, pending, params: { id }, location: { query } } = this.props
    let offset = projects.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  render () {
    let { projects } = this.props
    return <div>
      <ProjectCardContainer projects={projects}/>
      <ScrollListener onBottom={this.loadMore}/>
    </div>
  }
}

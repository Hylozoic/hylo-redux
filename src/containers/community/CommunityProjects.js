import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { FETCH_PROJECTS } from '../../actions'
import { fetchProjects } from '../../actions/fetchProjects'
import ProjectCardContainer from '../../components/ProjectCardContainer'
import ScrollListener from '../../components/ScrollListener'
import { cleanAndStringify } from '../../util/caching'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'community'

@prefetch(({ dispatch, params: { id } }) => {
  let cacheId = cleanAndStringify({subject, id})
  return dispatch(fetchProjects({subject, id, cacheId}))
})
@connect(({ projectsByQuery, totalProjectsByQuery, projects, pending }, { params: { id } }) => {
  let cacheId = cleanAndStringify({subject, id})
  return {
    projects: (projectsByQuery[cacheId] || []).map(id => projects[id]),
    total: totalProjectsByQuery[cacheId],
    pending: pending[FETCH_PROJECTS]
  }
})
export default class CommunityProjects extends React.Component {
  static propTypes = {
    projects: array,
    dispatch: func,
    total: number,
    pending: bool,
    params: object
  }

  loadMore = () => {
    let { dispatch, projects, pending, total, params: { id } } = this.props
    let offset = projects.length
    if (!pending && offset < total) {
      let cacheId = cleanAndStringify({subject, id})
      dispatch(fetchProjects({subject, id, offset, cacheId}))
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

import React from 'react'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetch, ConnectedProjectList } from '../ConnectedProjectList'
import { refetch } from '../../util/caching'
import ProjectListControls from '../../components/ProjectListControls'
const { func, object } = React.PropTypes

const subject = 'community'

@connect()
@prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query)))
export default class CommunityProjects extends React.Component {
  static propTypes = {
    dispatch: func,
    params: object,
    location: object
  }

  changeQuery = opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }

  render () {
    let { params: { id }, location: { query } } = this.props
    let { type, search } = query || {}
    return <div>
      <ProjectListControls onChange={this.changeQuery} type={type} search={search}/>
      <ConnectedProjectList {...{subject, id, query}}/>
    </div>
  }
}

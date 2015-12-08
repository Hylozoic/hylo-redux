import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedProjectList } from './ConnectedProjectList'
import ProjectListControls from '../components/ProjectListControls'
import { refetch } from '../util/caching'
const { func, object } = React.PropTypes

const subject = 'all'
const id = 'me' // just a placeholder; value isn't meaningful

@connect()
@prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, id, query)))
export default class Projects extends React.Component {
  static propTypes = {
    dispatch: func,
    location: object
  }

  changeQuery = opts => {
    let { dispatch, location } = this.props
    dispatch(refetch(opts, location))
  }

  render () {
    let { location: { query } } = this.props
    let { type, search } = query || {}

    return <div>
      <div className='row'>
        <div className='col-sm-4'>
          <h2>Projects</h2>
        </div>
        <div className='col-sm-8'>
          <ProjectListControls onChange={this.changeQuery} search={search} type={type}/>
        </div>
      </div>

      <ConnectedProjectList {...{subject, id, query}}/>
    </div>
  }
}

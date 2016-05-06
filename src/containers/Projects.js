import React from 'react'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import ProjectListControls from '../components/ProjectListControls'
import { refetch } from '../util/caching'
const { func, object } = React.PropTypes

const querystringDefaults = ({type: 'project', filter: 'all'})
export const setDefaults = query => ({...query, type: 'project'})

const fetchParams = (location, params, currentUser) => {
  const isInCommunity = location.pathname.startsWith('/c/')
  return {
    subject: isInCommunity ? 'community' : 'all-posts',
    id: isInCommunity ? params.id : currentUser.id
  }
}

@prefetch(({ dispatch, location, params, query, currentUser }) => {
  const { subject, id } = fetchParams(location, params, currentUser)
  return dispatch(fetch(subject, id, setDefaults(query)))
})
export default class Projects extends React.Component {
  static propTypes = {
    location: object,
    params: object
  }

  static contextTypes = {
    dispatch: func,
    currentUser: object
  }

  changeQuery = opts => {
    this.context.dispatch(refetch(opts, this.props.location, querystringDefaults))
  }

  render () {
    const { currentUser } = this.context
    const { location, params } = this.props
    const { subject, id } = fetchParams(location, params, currentUser)
    const query = setDefaults(location.query)
    const { filter, search } = query || {}

    return <div>
      <ProjectListControls onChange={this.changeQuery} search={search} filter={filter}/>
      <ConnectedPostList {...{subject, id, query}}/>
    </div>
  }
}

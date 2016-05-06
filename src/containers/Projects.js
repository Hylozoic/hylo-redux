import React from 'react'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import ProjectListControls from '../components/ProjectListControls'
import { refetch } from '../util/caching'
const { func, object } = React.PropTypes

const querystringDefaults = ({type: 'project', filter: 'all'})
const setDefaults = query => ({...query, type: 'project'})

const fetchParams = (location, params, currentUser) => {
  const isInCommunity = location.pathname.startsWith('/c/')
  return {
    subject: isInCommunity ? 'community' : 'all-posts',
    id: isInCommunity ? params.id : currentUser.id
  }
}

const Projects = prefetch(({ dispatch, location, params, query, currentUser }) => {
  const { subject, id } = fetchParams(location, params, currentUser)
  return dispatch(fetch(subject, id, setDefaults(query)))
})(({ location, params }, { currentUser, dispatch }) => {
  const { subject, id } = fetchParams(location, params, currentUser)
  const query = setDefaults(location.query)
  const { filter, search } = query || {}
  const changeQuery = opts =>
    dispatch(refetch(opts, location, querystringDefaults))

  return <div>
    <ProjectListControls onChange={changeQuery} search={search} filter={filter}/>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
})
Projects.propTypes = {location: object, params: object}
Projects.contextTypes = {dispatch: func, currentUser: object}

export default Projects

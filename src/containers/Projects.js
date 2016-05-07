import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import Select from '../components/Select'
import { debounce } from 'lodash'
import { paramsForFetch, refetch } from '../util/caching'
import { getCommunity } from '../models/community'
import { isInCommunity } from '../util'
const { func, object } = React.PropTypes

const querystringDefaults = ({type: 'project', filter: 'all'})
const setDefaults = query => ({...query, type: 'project'})

const Projects = ({ location, params, community }, { currentUser, dispatch }) => {
  const { subject, id } = paramsForFetch(location, params, currentUser)
  const query = setDefaults(location.query)
  const { filter, search } = query || {}
  const changeQuery = opts =>
    dispatch(refetch(opts, location, querystringDefaults))

  return <div>
    {community && <PostEditor community={community} type='project'/>}
    <ProjectListControls onChange={changeQuery} search={search} filter={filter}/>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}
Projects.propTypes = {location: object, params: object}
Projects.contextTypes = {dispatch: func, currentUser: object}

export default compose(
  prefetch(({ dispatch, location, params, query, currentUser }) => {
    const { subject, id } = paramsForFetch(location, params, currentUser)
    return dispatch(fetch(subject, id, setDefaults(query)))
  }),
  connect((state, { location, params: { id } }) => ({
    community: isInCommunity(location) ? getCommunity(id, state) : null
  }))
)(Projects)

const ProjectListControls = ({ onChange, filter, search }) => {
  const filters = [
    {name: 'All projects', id: 'all'},
    {name: 'Projects I started or joined', id: 'mine'}
  ]
  const selectedFilter = filter ? filters.find(t => t.id === filter) : filters[0]
  const delaySearch = debounce(search => onChange({search}), 500)

  return <div className='list-controls'>
    <input type='text' className='form-control search'
      placeholder='Search' defaultValue={search}
      onChange={event => delaySearch(event.target.value)}/>

    <Select className='type' choices={filters} selected={selectedFilter}
      onChange={t => onChange({filter: t.id})} alignRight={true}/>
  </div>
}

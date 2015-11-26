import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchPosts } from '../../actions/fetchPosts'
import ConnectedPostList from '../ConnectedPostList'
import PostListControls from '../../components/PostListControls'
import { createCacheId } from '../../util/caching'
import { compose } from 'redux'
import { navigate } from '../../actions'
const { func, object } = React.PropTypes

const fetch = (id, query = {}) => {
  let subject = 'person'
  let { type, sort, search } = query
  let cacheId = createCacheId({subject, id, type, sort, search})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...query})
}

const changeQuery = (opts, props) => {
  let { dispatch, location: { query, pathname } } = props
  let newQuery = createCacheId({...query, ...opts})
  let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
  dispatch(navigate(newPath))
}

const PersonPosts = props => {
  let { params: { id }, location: { query } } = props
  let { type, sort, search } = query
  let cacheId = createCacheId({subject: 'person', id, type, sort, search})
  return <div>
    <PostListControls onChange={opts => changeQuery(opts, props)}
      type={type} sort={sort} search={search}/>
    <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
  </div>
}

PersonPosts.propTypes = {
  person: object,
  params: object,
  dispatch: func
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(params.id, query))),
  connect((state, { params }) => ({person: state.people[params.id]}))
)(PersonPosts)

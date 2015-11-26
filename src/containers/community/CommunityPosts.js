import React from 'react'
import { fetchPosts } from '../../actions/fetchPosts'
import { navigate } from '../../actions'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import ConnectedPostList from '../../containers/ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import PostListControls from '../../components/PostListControls'
import { createCacheId } from '../../util/caching'
import { compose } from 'redux'
const { func, object } = React.PropTypes

const fetch = (id, query = {}) => {
  let { type, sort, search } = query
  let subject = 'community'
  let cacheId = createCacheId({subject, id, type, sort, search})
  return fetchPosts({subject, id, cacheId, limit: 20, ...query})
}

const changeQuery = (opts, props) => {
  let { dispatch, location: { query, pathname } } = props
  let newQuery = createCacheId({...query, ...opts})
  let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
  dispatch(navigate(newPath))
}

const CommunityPosts = props => {
  let { community, params: { id }, location: { query } } = props
  let { type, sort, search } = query
  let cacheId = createCacheId({subject: 'community', id, type, sort, search})

  return <div>
    <PostEditor community={community}/>
    <PostListControls onChange={opts => changeQuery(opts, props)} includeWelcome={true}
      type={type} sort={sort} search={search}/>
    <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
  </div>
}

CommunityPosts.propTypes = {
  dispatch: func,
  params: object,
  community: object,
  location: object
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(params.id, query))),
  connect((state, { params }) => ({community: state.communities[params.id]}))
)(CommunityPosts)

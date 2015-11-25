import React from 'react'
import { fetchPosts } from '../actions'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createCacheId } from '../util/caching'
import ConnectedPostList from './ConnectedPostList'
import PostEditor from '../components/PostEditor'

const fetch = (id, opts = {}) => {
  let subject = 'all-posts'
  let type = 'all'
  let cacheId = createCacheId({subject, id, type})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...opts})
}

const AllPosts = props => {
  let { id } = props.currentUser
  let cacheId = createCacheId({subject: 'all-posts', id, type: 'all'})
  return <div>
    <PostEditor/>
    <ConnectedPostList fetch={opts => fetch(id, opts)} id={cacheId}/>
  </div>
}

export default compose(
  prefetch(({ dispatch, params, currentUser }) => dispatch(fetch(currentUser.id))),
  connect(state => ({currentUser: state.people.current}))
)(AllPosts)

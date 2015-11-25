import React from 'react'
import { fetchPosts } from '../actions'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createCacheId } from '../util/caching'
import ConnectedPostList from './ConnectedPostList'
import PostEditor from '../components/PostEditor'

const fetch = subject => (id, opts = {}) => {
  let type = 'all'
  let cacheId = createCacheId({subject, id, type})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...opts})
}

const makeComponent = (subject, title, showEditor) => props => {
  let { id } = props.currentUser
  let cacheId = createCacheId({subject, id, type: 'all'})
  return <div>
    <h2>{title}</h2>
    {showEditor && <PostEditor/>}
    <ConnectedPostList fetch={opts => fetch(subject)(id, opts)} id={cacheId}/>
  </div>
}

const wrapComponent = (subject, ...args) => compose(
  prefetch(({ dispatch, params, currentUser }) => dispatch(fetch(subject)(currentUser.id))),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

export const FollowedPosts = wrapComponent('followed-posts', 'Followed posts')

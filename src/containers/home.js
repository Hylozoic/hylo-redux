import React from 'react'
import { fetchPosts } from '../actions/fetchPosts'
import { navigate } from '../actions'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { createCacheId } from '../util/caching'
import ConnectedPostList from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import PostListControls from '../components/PostListControls'

const fetch = (subject, id, query = {}) => {
  let { type, sort, search } = query
  let cacheId = createCacheId({subject, id, type, sort, search})
  return fetchPosts({subject, id, type, cacheId, limit: 20, ...query})
}

const changeQuery = (subject, opts, props) => {
  let { dispatch, location: { query, pathname } } = props
  let newQuery = createCacheId({...query, ...opts})
  let newPath = `${pathname}${newQuery ? '?' + newQuery : ''}`
  dispatch(navigate(newPath))
}

const makeComponent = (subject, title, showEditor) => props => {
  let { location: { query }, currentUser: { id } } = props
  let { type, sort, search } = query
  let cacheId = createCacheId({subject, id, type, sort, search})

  return <div>
    <div className='row'>
      <div className='col-sm-6'>
        <h2>{title}</h2>
      </div>
      <div className='col-sm-6'>
        <PostListControls onChange={opts => changeQuery(subject, opts, props)}
          type={type} sort={sort} search={search}/>
      </div>
    </div>
    {showEditor && <PostEditor/>}
    <ConnectedPostList fetch={opts => fetch(subject, id, opts)} id={cacheId}/>
  </div>
}

const wrapComponent = (subject, ...args) => compose(
  prefetch(({ dispatch, params, currentUser: { id }, query }) => dispatch(fetch(subject, id, query))),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

export const FollowedPosts = wrapComponent('followed-posts', 'Followed posts')

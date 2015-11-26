import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch, refetch, ConnectedPostList } from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import PostListControls from '../components/PostListControls'

const makeComponent = (subject, title, showEditor) => props => {
  let { location: { query }, currentUser: { id } } = props
  let { type, sort, search } = query

  return <div>
    <div className='row'>
      <div className='col-sm-6'>
        <h2>{title}</h2>
      </div>
      <div className='col-sm-6'>
        <PostListControls onChange={opts => refetch(opts, props)}
          type={type} sort={sort} search={search}/>
      </div>
    </div>
    {showEditor && <PostEditor/>}
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}

const wrapComponent = (subject, ...args) => compose(
  prefetch(({ dispatch, params, currentUser: { id }, query }) => dispatch(fetch(subject, id, query))),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

export const FollowedPosts = wrapComponent('followed-posts', 'Followed posts')

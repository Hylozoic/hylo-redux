import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import { refetch } from '../util/caching'
import PostEditor from '../components/PostEditor'
import PostListControls from '../components/PostListControls'

const makeComponent = (subject, title, showEditor) => props => {
  let { dispatch, location: { query }, currentUser: { id } } = props
  let { type, sort, search } = query

  return <div>
    <div className='row'>
      <div className='col-sm-4'>
        <h2>{title}</h2>
      </div>
      <div className='col-sm-8'>
        <PostListControls onChange={opts => dispatch(refetch(opts, props.location))}
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

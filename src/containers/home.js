import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import { refetch } from '../util/caching'
import PostEditor from '../components/PostEditor'
import PostListControls from '../components/PostListControls'
import CoverImagePage from '../components/CoverImagePage'
import { setCurrentCommunityId } from '../actions'

const earth = '/img/earth_1920x1080.jpg'

const makeComponent = (subject, title, showEditor) => props => {
  let { dispatch, location: { query }, currentUser: { id } } = props
  let { type, sort, search } = query

  return <CoverImagePage image={earth}>
    {showEditor && <PostEditor/>}
    <PostListControls onChange={opts => dispatch(refetch(opts, props.location))}
      type={type} sort={sort} search={search}/>
    <ConnectedPostList {...{subject, id, query}}/>
  </CoverImagePage>
}

const wrapComponent = (subject, ...args) => compose(
  prefetch(({ dispatch, params, currentUser: { id }, query }) => {
    dispatch(setCurrentCommunityId('all'))
    return dispatch(fetch(subject, id, query))
  }),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

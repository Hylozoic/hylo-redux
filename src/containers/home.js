import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import CoverImagePage from '../components/CoverImagePage'
import { setCurrentCommunityId } from '../actions'

const makeComponent = (subject, title, showEditor) => props => {
  const { location: { query }, currentUser: { id } } = props

  return <CoverImagePage>
    {showEditor && <PostEditor/>}
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

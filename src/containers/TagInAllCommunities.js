import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import CoverImagePage from '../components/CoverImagePage'
import TagPosts from './community/TagPosts'
import { setCurrentCommunityId } from '../actions'

const TagInAllCommunities = compose(
  prefetch(({ dispatch, params, currentUser: { id }, query }) =>
    dispatch(setCurrentCommunityId('all'))),
  connect(state => ({currentUser: state.people.current}))
)(props => {
  let { params, location } = props

  return <CoverImagePage>
    <TagPosts params={params} location={location}/>
  </CoverImagePage>
})

export default TagInAllCommunities

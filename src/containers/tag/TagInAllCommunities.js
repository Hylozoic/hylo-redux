import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import CoverImagePage from '../../components/CoverImagePage'
import { setCurrentCommunityId } from '../../actions'

const TagInAllCommunities = compose(
  prefetch(({ dispatch, params, currentUser: { id }, query }) =>
    dispatch(setCurrentCommunityId('all'))),
  connect(state => ({currentUser: state.people.current}))
)(({ children }) => {
  return <CoverImagePage>{children}</CoverImagePage>
})

export default TagInAllCommunities

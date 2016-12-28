// import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch } from '../../ConnectedPostList'
import { prefetch } from 'react-fetcher'
import { subject } from './component'
import component from './component'

const mapStateToProps = (state, { params }) => ({
  community: state.communities[params.id],
  currentUser: state.people.current
})

export default compose(
  prefetch(({ dispatch, params: { id }, query, currentUser, store }) =>
    dispatch(fetch(subject, id, query))),
  connect(mapStateToProps)
)(component)

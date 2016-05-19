import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetch, ConnectedPostList } from '../ConnectedPostList'
import { compose } from 'redux'
const { func, object } = React.PropTypes

const subject = 'network'

const NetworkPosts = props => {
  let { params: { id }, location: { query } } = props

  return <div>
    <ConnectedPostList {...{subject, id, query}}/>
  </div>
}

NetworkPosts.propTypes = {
  dispatch: func,
  params: object,
  location: object
}

export default compose(
  prefetch(({ dispatch, params, query }) => dispatch(fetch(subject, params.id, query))),
  connect((state, { params }) => ({network: state.networks[params.id]}))
)(NetworkPosts)

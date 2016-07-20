import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import CoverImagePage from '../components/CoverImagePage'
import { navigate } from '../actions'
import { saveCurrentCommunityId } from '../actions/util'
import { communityUrl } from '../routes'
import { getCommunity } from '../models/currentUser'
const { object } = React.PropTypes

const makeComponent = (subject, title, showEditor) => React.createClass({
  propTypes: {
    location: object,
    currentUser: object
  },

  componentDidMount: function () {
    const { query: { rd }, pathname } = this.props.location
    rd && window.history.replaceState({}, 'Hylo', pathname)
  },

  render: function () {
    const { location: { query }, currentUser: { id } } = this.props

    return <CoverImagePage>
      {showEditor && <PostEditor/>}
      <ConnectedPostList {...{subject, id, query}}/>
    </CoverImagePage>
  }
})

export const prefetchForWrapped = subject => ({ dispatch, params, currentUser, query, path }) => {
  const { id, settings } = currentUser
  const { currentCommunityId } = settings
  if (query.rd && currentCommunityId && currentCommunityId !== 'all') {
    const community = getCommunity(currentUser, currentCommunityId)
    if (community) return dispatch(navigate(communityUrl(community)))
  }

  return dispatch(fetch(subject, id, query))
  .then(() => saveCurrentCommunityId(dispatch, 'all', id))
}

const wrapComponent = (subject, ...args) => compose(
  prefetch(prefetchForWrapped(subject)),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

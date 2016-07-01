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
import { get, find } from 'lodash'
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

export const prefetchForWrapped = subject => ({ dispatch, params, currentUser: { id, settings, memberships }, query, path }) => {
  const { currentCommunityId } = settings
  if (query.rd && currentCommunityId) {
    if (currentCommunityId !== 'all') {
      const community = get(find(memberships, m => m.community_id === currentCommunityId), 'community')
      community && dispatch(navigate(communityUrl(community)))
    }
  }
  saveCurrentCommunityId(dispatch, 'all', id)
  return dispatch(fetch(subject, id, query))
}

const wrapComponent = (subject, ...args) => compose(
  prefetch(prefetchForWrapped(subject)),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

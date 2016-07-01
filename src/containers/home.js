import React from 'react'
import { prefetch } from 'react-fetcher'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import CoverImagePage from '../components/CoverImagePage'
import { navigate, fetchCommunity } from '../actions'
import { saveCurrentCommunityId } from '../actions/util'
import { communityUrl } from '../routes'
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

const wrapComponent = (subject, ...args) => compose(
  prefetch(({ dispatch, params, currentUser: { id, settings: { currentCommunityId } }, query, path }) => {
    if (query.rd && currentCommunityId) {
      if (currentCommunityId !== 'all') {
        // we only have the id, so have to fetch to get the slug
        return dispatch(fetchCommunity(currentCommunityId))
        .then(action => {
          if (action.error) return
          return dispatch(navigate(communityUrl(action.payload)))
        })
      }
    }
    saveCurrentCommunityId(dispatch, 'all', id)
    return dispatch(fetch(subject, id, query))
  }),
  connect(state => ({currentUser: state.people.current}))
)(makeComponent(subject, ...args))

export const AllPosts = wrapComponent('all-posts', 'All posts', true)

export const MyPosts = wrapComponent('person', 'My posts', true)

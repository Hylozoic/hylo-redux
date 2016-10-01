import React from 'react'
import { prefetch } from 'react-fetcher'
import CoverImagePage from '../components/CoverImagePage'
import { navigate } from '../actions'
import { saveCurrentCommunityId } from '../actions/util'
import { fetch, ConnectedPostList } from './ConnectedPostList'
import PostEditor from '../components/PostEditor'
import { getCommunity } from '../models/community'
import { communityUrl } from '../routes'
const { object } = React.PropTypes

const AllCommunities = ({ children }) =>
  <CoverImagePage>{children}</CoverImagePage>

const setCommunityAndFetchTags = ({ dispatch, store }) => {
  return saveCurrentCommunityId(dispatch, 'all', true)
}

export default prefetch(setCommunityAndFetchTags)(AllCommunities)

const subject = 'all-posts'

export const allPostsPrefetch = ({ store, dispatch, currentUser, query }) => {
  const { id, settings: { currentCommunityId } } = currentUser
  if (query.rd && currentCommunityId && currentCommunityId !== 'all') {
    const community = getCommunity(currentCommunityId, store.getState())
    if (community) return dispatch(navigate(communityUrl(community)))
  }

  return dispatch(fetch(subject, id, query))
  .then(() => saveCurrentCommunityId(dispatch, 'all', true))
}

@prefetch(allPostsPrefetch)
export class AllPosts extends React.Component {
  static propTypes = {location: object}
  static contextTypes = {currentUser: object}

  componentDidMount () {
    const { query: { rd }, pathname } = this.props.location
    rd && window.history.replaceState({}, 'Hylo', pathname)
  }

  render () {
    const { location: { query } } = this.props
    const { currentUser: { id } } = this.context

    return <div>
      <PostEditor/>
      <ConnectedPostList {...{subject, id, query}}/>
    </div>
  }
}

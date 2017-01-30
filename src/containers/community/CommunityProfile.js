import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { get } from 'lodash'
import { FETCH_COMMUNITY } from '../../constants'
import {
  fetchCommunity, fetchCommunitiesForNetworkNav, saveCurrentCommunityId
} from '../../actions'
import { VIEWED_COMMUNITY, trackEvent } from '../../util/analytics'
import CoverImagePage from '../../components/CoverImagePage'
import AccessErrorMessage from '../../components/AccessErrorMessage'
import { canModerate } from '../../models/currentUser'
const { func, object } = React.PropTypes

class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    children: object,
    location: object,
    dispatch: func,
    error: object
  }

  static contextTypes = {currentUser: object}

  componentDidMount () {
    const { community } = this.props
    if (community) this.fetchCommunitiesForNetworkNav(community)
  }

  componentWillReceiveProps (nextProps) {
    if (get(nextProps.community, 'network.id') !== get(this.props.community, 'network.id')) {
      this.fetchCommunitiesForNetworkNav(nextProps.community)
    }
  }

  fetchCommunitiesForNetworkNav (community) {
    const { dispatch } = this.props
    const { currentUser } = this.context
    const networkId = get(community, 'network.id')
    if (!networkId || !currentUser) return
    dispatch(fetchCommunitiesForNetworkNav(networkId))
  }

  render () {
    const { community, children, error } = this.props
    const { currentUser } = this.context

    if (error) {
      return <AccessErrorMessage error={error} />
    }

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!community || !community.banner_url) {
      return <div className='loading'>Loading...</div>
    }

    const isModerator = canModerate(currentUser, community)

    return <CoverImagePage id='community'
      image={community.banner_url}
      community={isModerator ? community : null}>
      {children}
    </CoverImagePage>
  }
}

export default compose(
  prefetch(({ store, dispatch, params: { id }, currentUser }) =>
     dispatch(fetchCommunity(id))
    .then(() => {
      const state = store.getState()
      const communityId = get(state.communities[id], 'id')
      return saveCurrentCommunityId(dispatch, communityId, !!currentUser)
    })
  ),
  defer(({ params: { id }, store }) => {
    const community = store.getState().communities[id]
    if (community) return trackEvent(VIEWED_COMMUNITY, {community})
  }),
  connect((state, props) => ({
    community: state.communities[props.params.id],
    error: state.errors[FETCH_COMMUNITY]
  }))
)(CommunityProfile)

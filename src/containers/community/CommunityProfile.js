import React from 'react'
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { get } from 'lodash'
import { fetchCommunity, fetchCommunitiesForNetworkNav } from '../../actions/communities'
import { saveCurrentCommunityId } from '../../actions/util'
import { VIEWED_COMMUNITY, trackEvent } from '../../util/analytics'
import CoverImagePage from '../../components/CoverImagePage'
const { func, object } = React.PropTypes

class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    currentUser: object,
    children: object,
    location: object,
    dispatch: func
  }

  componentDidMount () {
    this.fetchCommunitiesForNetworkNav(this.props.community)
  }

  componentWillReceiveProps (nextProps) {
    if (get(nextProps.community, 'network.id') !== get(this.props.community, 'network.id')) {
      this.fetchCommunitiesForNetworkNav(nextProps.community)
    }
  }

  fetchCommunitiesForNetworkNav (community) {
    const { dispatch } = this.props
    const networkId = get(community, 'network.id')
    if (!networkId) return
    dispatch(fetchCommunitiesForNetworkNav(networkId))
  }

  render () {
    let { community, children } = this.props

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!community || !community.banner_url) {
      return <div className='loading'>Loading...</div>
    }

    return <CoverImagePage id='community' image={community.banner_url}>
      {children}
    </CoverImagePage>
  }
}

export default compose(
  prefetch(({ store, dispatch, params: { id } }) =>
     dispatch(fetchCommunity(id))
    .then(() => {
      const state = store.getState()
      const communityId = get(state.communities[id], 'id')
      const userId = get(state.people, 'current.id')
      return saveCurrentCommunityId(dispatch, communityId, userId)
    })
  ),
  defer(({ params: { id }, store }) => {
    const community = store.getState().communities[id]
    return trackEvent(VIEWED_COMMUNITY, {community})
  }),
  connect((state, props) => ({
    community: state.communities[props.params.id],
    currentUser: state.people.current
  }))
)(CommunityProfile)

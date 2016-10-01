import React from 'react'
import CoverImagePage from '../../components/CoverImagePage'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchNetwork } from '../../actions/network'
import { get } from 'lodash/fp'
import { setCurrentNetworkId } from '../../actions'
import { fetchCommunitiesForNetworkNav } from '../../actions/communities'
const { func, object } = React.PropTypes

@prefetch(({ store, dispatch, params: { id } }) =>
  dispatch(fetchNetwork(id))
  .then(() => {
    const network = store.getState().networks[id]
    network && dispatch(setCurrentNetworkId(network.id))
  }))
@connect((state, props) => ({
  network: state.networks[props.params.id]
}))
export default class NetworkProfile extends React.Component {
  static propTypes = {
    network: object,
    children: object,
    dispatch: func,
    params: object
  }

  componentDidMount () {
    const { dispatch, network } = this.props
    if (!get('id', network)) return
    dispatch(fetchCommunitiesForNetworkNav(network.id))
  }

  render () {
    let { network, children } = this.props

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!network || !network.banner_url) return <div>Loading...</div>

    return <CoverImagePage image={network.banner_url}>
      {children}
    </CoverImagePage>
  }
}

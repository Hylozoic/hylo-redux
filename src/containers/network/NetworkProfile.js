import React from 'react'
import CoverImagePage from '../../components/CoverImagePage'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchNetwork } from '../../actions/network'
import { setCurrentNetworkId } from '../../actions'
const { func, object } = React.PropTypes

@prefetch(({ store, dispatch, params: { id } }) =>
  dispatch(fetchNetwork(id))
  .then(() => {
    const network = store.getState().networks[id]
    network && dispatch(setCurrentNetworkId(network.id))
  }))
@connect((state, props) => ({
  network: state.networks[props.params.id],
  currentUser: state.people.current
}))
export default class NetworkProfile extends React.Component {
  static propTypes = {
    network: object,
    children: object,
    dispatch: func
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

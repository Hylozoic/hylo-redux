import React from 'react'
import { A, IndexA } from '../../components/A'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchNetwork } from '../../actions'
const { func, object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchNetwork(id)))
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
    let { network } = this.props

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!network || !network.banner_url) return <div>Loading...</div>

    let { slug, banner_url, avatar_url, name } = network

    return <div id='community'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${banner_url})`}}/>
        <div className='logo' style={{backgroundImage: `url(${avatar_url})`}}/>
        <h2>{name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/n/${slug}`}>Posts</IndexA></li>
          <li><A to={`/n/${slug}/communities`}>Communities</A></li>
          <li><A to={`/n/${slug}/members`}>Members</A></li>
          <li><A to={`/n/${slug}/about`}>About</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}

import React from 'react'
import { A, IndexA } from '../components/A'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchCommunity } from '../actions'
const { object } = React.PropTypes

@prefetch(({dispatch, params: {id}}) => dispatch(fetchCommunity(id)))
@connect((state, props) => ({community: state.communities[props.params.id]}))
export default class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    children: object
  }

  render () {
    var { community } = this.props

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!community || !community.banner_url) return <div>Loading...</div>

    let { slug, banner_url, avatar_url, name } = community

    return <div id='community'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${banner_url})`}}/>
        <div className='logo' style={{backgroundImage: `url(${avatar_url})`}}/>
        <h2>{name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/c/${slug}`}>Posts</IndexA></li>
          <li><A to={`/c/${slug}/events`}>Events</A></li>
          <li><a>Projects</a></li>
          <li><A to={`/c/${slug}/members`}>Members</A></li>
          <li><A to={`/c/${slug}/about`}>About</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}

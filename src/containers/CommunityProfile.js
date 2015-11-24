import React from 'react'
import { IndexLink, Link } from 'react-router'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchCommunity } from '../actions'
const { object } = React.PropTypes

@prefetch(({dispatch, params: {slug}}) => dispatch(fetchCommunity(slug)))
@connect((state, props) => ({community: state.communities[props.params.slug]}))
export default class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    children: object
  }

  render () {
    var { community } = this.props
    if (!community) return <div>Loading...</div>

    let { slug } = community

    return <div id='community'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${community.banner_url})`}}/>
        <div className='logo' style={{backgroundImage: `url(${community.avatar_url})`}}/>
        <h2>{community.name}</h2>
        <ul className='tabs'>
          <li><IndexLink to={`/c/${slug}`} activeClassName='active'>Posts</IndexLink></li>
          <li><a>Events</a></li>
          <li><a>Projects</a></li>
          <li><a>Members</a></li>
          <li><a>About</a></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}

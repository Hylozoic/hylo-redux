import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchCommunity } from '../actions'
const { object } = React.PropTypes

@prefetch(({dispatch, params: {slug}}) => dispatch(fetchCommunity(slug)))
@connect(state => ({community: state.communityProfile.community}))
export default class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    children: object
  }

  render () {
    var community = this.props.community
    if (!community) return <div>Loading...</div>

    return <div id='community'>
      <div className='banner' style={{backgroundImage: `url(${community.banner_url})`}}>
        <div className='logo' style={{backgroundImage: `url(${community.avatar_url})`}}/>
        <h2>{community.name}</h2>
        <ul className='tabs'>
          <li><a>Posts</a></li>
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

import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchUser } from '../actions'
import { A, IndexA } from '../components/A'
const { object } = React.PropTypes

const defaultBanner = 'http://cdn.hylo.com/misc/default_user_banner.jpg'

@prefetch(({ dispatch, params: {userId} }) => dispatch(fetchUser(userId)))
@connect((state, props) => ({user: state.users[props.params.userId]}))
export default class UserProfile extends React.Component {
  static propTypes = {
    params: object,
    user: object,
    children: object
  }

  render () {
    let user = this.props.user
    if (!user) return <div>Loading...</div>

    let bannerUrl = user.banner_url || defaultBanner
    return <div id='user'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${bannerUrl})`}}/>
        <div className='logo person' style={{backgroundImage: `url(${user.avatar_url})`}}/>
        <h2>{user.name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/u/${user.id}`}>About</IndexA></li>
          <li><A to={`/u/${user.id}/posts`}>Posts</A></li>
          <li><A to={`/u/${user.id}/contributions`}>Contributions</A></li>
          <li><A to={`/u/${user.id}/thanks`}>Thanks</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}

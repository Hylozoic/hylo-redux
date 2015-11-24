import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { fetchUser } from '../actions'
const { object } = React.PropTypes

const defaultBanner = 'http://cdn.hylo.com/misc/default_user_banner.jpg'

@prefetch(({ dispatch, params: {userId} }) => dispatch(fetchUser(userId)))
@connect((state, props) => ({user: state.users[props.params.userId]}))
export default class UserProfile extends React.Component {
  static propTypes = {
    params: object,
    user: object
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
      </div>
    </div>
  }
}

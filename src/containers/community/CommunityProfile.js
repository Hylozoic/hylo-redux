import React from 'react'
import { A, IndexA } from '../../components/A'
import { connect } from 'react-redux'
import { prefetch, defer } from 'react-fetcher'
import { find } from 'lodash'
import { fetchCommunity } from '../../actions'
import { VIEWED_COMMUNITY, trackEvent } from '../../util/analytics'
const { object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchCommunity(id)))
@defer(({ params: { id }, store }) => {
  let community = store.getState().communities[id]
  return trackEvent(VIEWED_COMMUNITY, {community})
})
@connect((state, props) => ({
  community: state.communities[props.params.id],
  currentUser: state.people.current
}))
export default class CommunityProfile extends React.Component {
  static propTypes = {
    community: object,
    currentUser: object,
    children: object
  }

  render () {
    var { community, currentUser } = this.props

    // we might have partial data for a community already; if this component
    // renders without banner_url, it'll cause a request to an invalid url
    if (!community || !community.banner_url) return <div>Loading...</div>

    let { slug, banner_url, avatar_url, name } = community

    let canModerate = !!find(currentUser.memberships, m => m.community.id === community.id && m.role === 1)

    return <div id='community'>
      <div className='banner'>
        <div className='background' style={{backgroundImage: `url(${banner_url})`}}/>
        <div className='corner'>
          {canModerate && <A to={`/c/${slug}/settings`}>Settings</A>}
        </div>
        <div className='logo' style={{backgroundImage: `url(${avatar_url})`}}/>
        <h2>{name}</h2>
        <ul className='tabs'>
          <li><IndexA to={`/c/${slug}`}>Posts</IndexA></li>
          <li><A to={`/c/${slug}/events`}>Events</A></li>
          <li><A to={`/c/${slug}/projects`}>Projects</A></li>
          <li><A to={`/c/${slug}/members`}>Members</A></li>
          <li><A to={`/c/${slug}/about`}>About</A></li>
        </ul>
      </div>
      {this.props.children}
    </div>
  }
}

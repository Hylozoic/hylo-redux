import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
const { object, func, array } = React.PropTypes
import { isEmpty, set } from 'lodash'
import { get } from 'lodash/fp'
import { fetchInvitations, fetchJoinRequests } from '../../actions'
import {
  fetchCommunitySettings,
  updateCommunitySettings
} from '../../actions/communities'
import { hasFeature } from '../../models/currentUser'
import { REQUEST_TO_JOIN_COMMUNITY } from '../../config/featureFlags'
import { communityJoinUrl } from '../../routes'
import InvitationList from './InvitationList'
import JoinRequestList from './JoinRequestList'
import { InviteForm } from '../InviteModal'

@prefetch(({dispatch, params: {id}}) =>
  Promise.all([
    dispatch(fetchCommunitySettings(id)),
    dispatch(fetchInvitations(id)),
    dispatch(fetchJoinRequests(id))
  ]))
@connect((state, { params }) => ({
  community: state.communities[params.id],
  validation: state.communityValidation,
  invitations: state.invitations[params.id],
  joinRequests: state.joinRequests[params.id]
}))
export default class CommunitySettings extends React.Component {

  static propTypes = {
    community: object,
    dispatch: func,
    location: object,
    validation: object,
    invitations: array,
    joinRequests: array
  }

  static contextTypes = {currentUser: object}

  update (path, value) {
    let { dispatch, community: { id, slug } } = this.props
    return dispatch(updateCommunitySettings(id, set({slug}, path, value)))
  }

  toggle (path) {
    this.update(path, !get(path, this.props.community))
  }

  render () {
    const { community, invitations, joinRequests } = this.props
    const { currentUser } = this.context
    const joinUrl = communityJoinUrl(community)

    return <div className='form-sections' id='community-invite-settings'>
      <div>
        <label>Invitation code link</label>
        <p><a href={joinUrl}>{joinUrl}</a></p>
        <p className='summary'>You can share this link to allow people to join your community without having to invite them individually.</p>
      </div>
      <div>
        <InviteForm community={community}/>
      </div>
      {!isEmpty(invitations) &&
        <div>
          <label>Sent Invitations</label>
          <p className='summary'>These are people you have already sent invitations to.</p>
          <InvitationList id={community.slug}/>
        </div>}
      {hasFeature(currentUser, REQUEST_TO_JOIN_COMMUNITY) && !isEmpty(joinRequests) &&
        <div ref='joinRequests'>
          <label>Requests</label>
          <JoinRequestList id={community.slug}/>
        </div>}
    </div>
  }
}

import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
const { object, func, array } = React.PropTypes
import { isEmpty, set } from 'lodash'
import { get } from 'lodash/fp'
import {
  fetchInvitations,
  fetchJoinRequests,
  fetchCommunitySettings,
  updateCommunitySettings
} from '../../actions'
import { hasFeature } from '../../models/currentUser'
import { REQUEST_TO_JOIN_COMMUNITY } from '../../config/featureFlags'
import { communityJoinUrl } from '../../routes'
import InvitationList from './InvitationList'
import JoinRequestList from './JoinRequestList'
import { InviteForm } from '../InviteModal'
import Icon from '../../components/Icon'
import copy from 'copy-to-clipboard'

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
export default class CommunityInvite extends React.Component {

  static propTypes = {
    community: object,
    dispatch: func,
    validation: object,
    invitations: array,
    joinRequests: array
  }

  static contextTypes = {currentUser: object}

  constructor (props) {
    super(props)
    this.state = {
      copied: false
    }
  }

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
    const { copied } = this.state
    const joinUrl = communityJoinUrl(community)

    const copyLink = () => copy(joinUrl) && this.setState({copied: true})

    return <div className='form-sections' id='community-invite-settings'>
      <div className='modal-input invitation-link-section'>
        <div className='copy-link-wrapper'>
          {copied && <span className='copied'>(copied) </span>}
          <a className='copy-link' onClick={copyLink}>Copy Link</a>
        </div>
        <Icon name='Link' />
        Anyone with this link can join the community
        <br />
        <a className='invitation-link' href={joinUrl}>{joinUrl}</a>
      </div>
      <div>
        <InviteForm community={community} allowModerators showHeader />
      </div>
      {hasFeature(currentUser, REQUEST_TO_JOIN_COMMUNITY) && !isEmpty(joinRequests) &&
        <JoinRequestList id={community.slug} />}
      {!isEmpty(invitations) && <InvitationList id={community.slug} />}
    </div>
  }
}

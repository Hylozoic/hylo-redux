import React, { Component } from 'react'
const { func, object } = React.PropTypes
// Redux connection related
import { compose } from 'redux'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
// Component related
import {
  COMMUNITY_SETUP_CHECKLIST, REQUEST_TO_JOIN_COMMUNITY
} from '../../config/featureFlags'
import ConnectedPostList, { fetch } from '../ConnectedPostList'
import PostEditor from '../../components/PostEditor'
import ProfileSkillsModule from '../../components/ProfileSkillsModule'
import ProfileBioModule from '../../components/ProfileBioModule'
import { PercentBar } from '../ChecklistModal'
import {
  isMember, canModerate, hasFeature, hasBio, hasSkills
} from '../../models/currentUser'
import { navigate, notify, showModal } from '../../actions'
import { requestToJoinCommunity } from '../../actions/communities'
import { getChecklist, checklistPercentage } from '../../models/community'

export const subject = 'community'

export class CommunityPosts extends Component {
  static propTypes = {
    dispatch: func,
    params: object,
    community: object,
    location: object
  }
  static contextTypes = {currentUser: object}
  static childContextTypes = {community: object}

  getChildContext () {
    let { community } = this.props
    return {community}
  }

  requestToJoin (opts) {
    const { community, dispatch } = this.props
    const { currentUser } = this.context

    if (!currentUser) return dispatch(navigate(`/signup?next=/c/${community.slug}?join=true`))
    return dispatch(requestToJoinCommunity(community.slug))
    .then(({ error }) => error
      ? dispatch(notify('There was a problem saving your request; please try again later.', {...opts, type: 'error'}))
      : dispatch(notify('Your request to join has been sent to the community moderators.', opts)))
  }

  componentDidMount () {
    let { location: { query }, dispatch, community } = this.props
    const { currentUser } = this.context
    let { checklist, join } = query || {}
    if (checklist && hasFeature(currentUser, COMMUNITY_SETUP_CHECKLIST) &&
      checklistPercentage(getChecklist(community)) !== 100) {
      dispatch(showModal('checklist'))
    }
    if (join && hasFeature(currentUser, REQUEST_TO_JOIN_COMMUNITY) &&
      !isMember(currentUser, community)) {
      this.requestToJoin({maxage: false})
    }
  }

  render () {
    let { location: { query }, dispatch, community, params: { id } } = this.props
    const { currentUser } = this.context

    return <div>
      {hasFeature(currentUser, COMMUNITY_SETUP_CHECKLIST) && canModerate(currentUser, community) &&
        <CommunitySetup community={community} dispatch={dispatch} />}
      {isMember(currentUser, community) &&
        <ProfileCompletionModules person={currentUser} />}
      {isMember(currentUser, community) &&
        <PostEditor community={community} />}
      {hasFeature(currentUser, REQUEST_TO_JOIN_COMMUNITY) && !isMember(currentUser, community) &&
        <div className='request-to-join'>
          You are not a member of this community. <a onClick={() => this.requestToJoin()} className='button'>Request to Join</a>
        </div>}
      <ConnectedPostList {...{subject, id, query}} />
      {!isMember(currentUser, community) && <div className='post-list-footer'>
        You are not a member of this community, so you are shown only posts that are marked as public.
      </div>}
    </div>
  }
}

const CommunitySetup = ({ community, dispatch }) => {
  const checklist = getChecklist(community)
  const percent = checklistPercentage(checklist)
  if (percent === 100) return null
  return <div className='community-setup'
    onClick={() => dispatch(showModal('checklist'))}>
    <PercentBar percent={percent} />
    Your community is {percent}% set up. <a>Click here</a> to continue setting it up.
  </div>
}

const ProfileCompletionModules = ({ person }) => {
  if (!hasBio(person)) {
    return <ProfileBioModule person={person} />
  } else if (!hasSkills(person)) {
    return <ProfileSkillsModule person={person} />
  } else {
    return null
  }
}

// Redux connection

const mapStateToProps = (state, { params }) => ({
  community: state.communities[params.id],
  currentUser: state.people.current
})

export default compose(
  prefetch(({ dispatch, params: { id }, query, currentUser, store }) =>
    dispatch(fetch(subject, id, query))),
  connect(mapStateToProps)
)(CommunityPosts)

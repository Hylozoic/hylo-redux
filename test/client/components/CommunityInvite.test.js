import support from '../support'
import { mount } from 'enzyme'
import React from 'react'
import CommunityInvite from '../../../src/containers/community/CommunityInvite'
import { configureStore } from '../../../src/store'
import { MemberRole } from '../../../src/models/community'

const community = {
  id: '1',
  slug: 'foomunity',
  name: 'Foom Unity',
  beta_access_code: 'foom',
  description: 'Social cohesion in the face of AI hard takeoff'
}

const currentUser = {
  id: '5',
  memberships: {
    [community.slug]: {
      community_id: community.id,
      role: MemberRole.MODERATOR
    }
  }
}

describe('CommunityInvite', () => {
  var store

  beforeEach(() => {
    store = configureStore({
      communities: {[community.slug]: community},
      people: {current: currentUser},
      invitations: {[community.slug]: [{id: 1}]},
      joinRequests: {[community.slug]: [{id: 1, user: {}}]}
    }).store
    window.FEATURE_FLAGS = {REQUEST_TO_JOIN_COMMUNITY: 'on'}
  })

  it('renders without errors', () => {
    const props = {
      params: {id: community.slug}
    }

    const node = mount(<CommunityInvite {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    expect(node.find('.invitation-link a').first().text())
    .to.equal(`${process.env.UPSTREAM_HOST}/c/foomunity/join/foom`)

    expect(node.find('#community-invite-form label').map(n => n.text().trim()))
    .to.deep.equal(['Upload CSV', 'Import CSV File (optional)', ''])

    expect(node.find('.invitations').length).to.equal(1)

    expect(node.find('.join-requests').length).to.equal(1)
  })
})

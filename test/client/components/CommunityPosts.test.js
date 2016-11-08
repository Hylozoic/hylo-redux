require('../support')
import { mount } from 'enzyme'
import React from 'react'
import CommunityPosts from '../../../src/containers/community/CommunityPosts'
import { configureStore } from '../../../src/store'

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
      community_id: community.id
    }
  }
}

describe('CommunityPosts', () => {
  var store

  beforeEach(() => {
    store = configureStore({
      communities: {[community.slug]: community}
    }).store
    window.FEATURE_FLAGS = {
      REQUEST_TO_JOIN_COMMUNITY: 'on',
      COMMUNITY_SETUP_CHECKLIST: 'on'
    }
  })

  it('renders without errors', () => {
    const props = {
      params: {id: community.slug},
      location: {}
    }

    const node = mount(<CommunityPosts {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    expect(node.find('.community-setup').length).to.equal(1)

    expect(node.find('.post-editor').length).to.equal(1)

    expect(node.find('.no-results').length).to.equal(1)
  })

  it('displays request to join and no PostEditor, when not a member', () => {
    const props = {
      params: {id: community.slug},
      location: {}
    }

    const node = mount(<CommunityPosts {...props}/>, {
      context: {store, currentUser: {id: 6}},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    expect(node.find('.post-editor').length).to.equal(0)

    expect(node.find('.request-to-join').text())
    .to.equal('You are not a member of this community. Request to Join')
  })
})

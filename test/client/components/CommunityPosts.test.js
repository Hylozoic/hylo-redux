import '../support'
import { mount } from 'enzyme'
import { mockActionResponse, wait } from '../../support/helpers'
import React, { PropTypes } from 'react'
import CommunityPosts from '../../../src/containers/community/CommunityPosts'
import ProfileSkillsModule from '../../../src/components/ProfileSkillsModule'
import ProfileBioModule from '../../../src/components/ProfileBioModule'
import { configureStore } from '../../../src/store'
import { MemberRole } from '../../../src/models/community'
import { updateCurrentUser } from '../../../src/actions'

const community = {
  id: '1',
  slug: 'foomunity',
  name: 'Foom Unity',
  beta_access_code: 'foom',
  description: 'Social cohesion in the face of AI hard takeoff'
}

const currentUser = {
  id: '5',
  name: 'Honesty Counts',
  bio: '',
  memberships: {
    [community.slug]: {
      community_id: community.id,
      role: MemberRole.MODERATOR
    }
  }
}

describe('CommunityPosts', () => {
  let store

  beforeEach(() => {
    store = configureStore({
      communities: {[community.slug]: community},
      people: {
        current: currentUser
      }
    }).store
    window.FEATURE_FLAGS = {
      REQUEST_TO_JOIN_COMMUNITY: 'on',
      COMMUNITY_SETUP_CHECKLIST: 'on',
      IN_FEED_PROFILE_COMPLETION_MODULES: 'on'
    }
  })

  it('renders without errors', () => {
    const props = {
      params: {id: community.slug},
      location: {}
    }

    const node = mount(<CommunityPosts {...props} />, {
      context: {store, currentUser},
      childContextTypes: {currentUser: PropTypes.object}
    })
    mockActionResponse(updateCurrentUser(), {})

    expect(node.find('.community-setup').length).to.equal(1)

    expect(node.find('.post-editor').length).to.equal(1)

    expect(node.find('.no-results').length).to.equal(1)
  })

  it('displays request to join and no PostEditor, when not a member', () => {
    const props = {
      params: {id: community.slug},
      location: {}
    }

    const node = mount(<CommunityPosts {...props} />, {
      context: {store, currentUser: {id: 6}},
      childContextTypes: {currentUser: PropTypes.object}
    })

    expect(node.find('.post-editor').length).to.equal(0)

    expect(node.find('.request-to-join').text())
    .to.equal('You are not a member of this community. Request to Join')
  })

  describe('ProfileCompletionModules', () => {
    const setup = (user) => {
      const props = {params: {id: community.slug}, location: {}}
      let mergedUser = {
        id: '5',
        name: 'Honesty Counts',
        bio: null,
        memberships: {
          [community.slug]: {
            community_id: community.id,
            role: MemberRole.MODERATOR
          }
        },
        ...user
      }
      mockActionResponse(updateCurrentUser(), {})
      return mount(
        <CommunityPosts {...props} />, {
          context: {currentUser: mergedUser, store, dispatch: store.dispatch},
          childContextTypes: {
            currentUser: PropTypes.object, dispatch: PropTypes.func
          }
        }
      )
    }

    it('displays bio module if no bio entered', () => {
      const node = setup(
        {bio: ''}
      )
      expect(node.find(ProfileBioModule).length).to.equal(1)
      expect(node.find(ProfileSkillsModule).length).to.equal(0)
    })

    it('displays skills module if bio already entered', () => {
      const node = setup(
        {bio: 'This is a bio'}
      )
      expect(node.find(ProfileBioModule).length).to.equal(0)
      expect(node.find(ProfileSkillsModule).length).to.equal(1)
    })

    it('displays no bio or skills module if they\'re both already populated', () => {
      const node = setup(
        {bio: 'This is a bio', tags: ['hackysack']}
      )
      expect(node.find(ProfileBioModule).length).to.equal(0)
      expect(node.find(ProfileSkillsModule).length).to.equal(0)
    })
  })
})

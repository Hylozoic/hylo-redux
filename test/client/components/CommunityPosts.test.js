import '../support'
import { mount } from 'enzyme'
import { mockActionResponse, wait } from '../../support/helpers'
import React, { PropTypes } from 'react'
import CommunityPosts from '../../../src/containers/community/CommunityPosts'
import ProfileSkillsModule from '../../../src/components/ProfileSkillsModule'
import ProfileBioModule from '../../../src/components/ProfileBioModule'
import { configureStore } from '../../../src/store'
import { MemberRole } from '../../../src/models/community'
import { updateUserSettings } from '../../../src/actions'

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
    mockActionResponse(updateUserSettings(), {})

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
    let node

    beforeEach(() => {
      const props = {
        params: {id: community.slug},
        location: {}
      }
      node = mount(
        <CommunityPosts {...props} />, {
          context: {store, currentUser, dispatch: store.dispatch},
          childContextTypes: {
            currentUser: PropTypes.object,
            dispatch: PropTypes.func
          }
        }
      )
      mockActionResponse(updateUserSettings(), {})
    })

    it('displays bio module if no bio entered', () => {
      expect(node.find(ProfileBioModule).length).to.equal(1)
      expect(node.find(ProfileSkillsModule).length).to.equal(0)
    })

    it('saves bio', () => {
      const bioTextArea = node.find(ProfileBioModule).first().find('textarea').first()
      bioTextArea.simulate('change', {target: {value: 'test bio'}})
      const saveButton = node.find(ProfileBioModule).first().find('button').first()
      saveButton.simulate('click')
      expect(store.getState().people.current.bio).to.equal('test bio')
      // LEJ: How do I get the currentUser in context updating correctly
      //      in this set up? Prefetch?
      //
      // expect(node.find(ProfileBioModule).length).to.equal(0)
      // expect(node.find(ProfileSkillsModule).length).to.equal(1)
    })

    // it('hides bio module when bio is present')
    // it('displayds skills module when none entered and bio is entered')
    // it('displays only bio module when both bio and skills are emtpy')
  })
})

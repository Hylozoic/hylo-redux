import '../support'
import { mockify, unspyify, mockActionResponse } from '../../support/helpers'
import { mount } from 'enzyme'
import React, { PropTypes } from 'react'
import { configureStore } from '../../../src/store'

import * as util from '../../../src/util'
import { MemberRole } from '../../../src/models/community'
import { updateCurrentUser } from '../../../src/actions'
import ProfileSkillsModule from '../../../src/components/ProfileSkillsModule'
import ProfileBioModule from '../../../src/components/ProfileBioModule'
import CommunityPosts, {
  MIN_MEMBERS_FOR_SKILLS_MODULE, MIN_POSTS_FOR_POST_PROMPT_MODULE
} from '../../../src/containers/community/CommunityPosts'

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
  bio: null,
  memberships: {
    [community.slug]: {
      community_id: community.id,
      role: MemberRole.MODERATOR
    }
  }
}

describe('CommunityPosts', () => {
  beforeEach(() => {
    window.FEATURE_FLAGS = {
      REQUEST_TO_JOIN_COMMUNITY: 'on',
      COMMUNITY_SETUP_CHECKLIST: 'on',
      IN_FEED_PROFILE_COMPLETION_MODULES: 'on'
    }
  })

  const setupNode = (setupCommunity = community, setupCurrentUser = currentUser) => {
    const store = configureStore({
      communities: {[setupCommunity.slug]: setupCommunity}
    }).store
    const props = {
      params: {id: setupCommunity.slug},
      location: {}
    }
    return mount(<CommunityPosts {...props} />, {
      context: {store, currentUser: setupCurrentUser},
      childContextTypes: {currentUser: PropTypes.object}
    })
  }

  it('renders without errors', () => {
    const node = setupNode(community)
    expect(node.find('.community-setup').length).to.equal(1)
    expect(node.find('.post-editor').length).to.equal(1)
    expect(node.find('.no-results').length).to.equal(1)
  })

  it('displays request to join and no PostEditor, when not a member', () => {
    const nonCommunityMember = {id: 6}
    const node = setupNode(community, nonCommunityMember)
    expect(node.find('.post-editor').length).to.equal(0)
    expect(node.find('.request-to-join').text())
    .to.equal('You are not a member of this community. Request to Join')
  })

  describe('Engagement Modules', () => {
    it('displays the correct engagement modules according to rules', () => {
      let node = setupNode({...community,
        memberCount: MIN_MEMBERS_FOR_SKILLS_MODULE - 1,
        postCount: MIN_POSTS_FOR_POST_PROMPT_MODULE - 1
      })
      expect(node.find('.popular-skills').length).to.equal(0)
      expect(node.find('.post-prompt').length).to.equal(0)

      // Shows Popular Skills prompt
      node = setupNode({...community,
        memberCount: MIN_MEMBERS_FOR_SKILLS_MODULE,
        postCount: MIN_POSTS_FOR_POST_PROMPT_MODULE - 1
      })
      expect(node.find('.popular-skills').length).to.equal(1)
      expect(node.find('.post-prompt').length).to.equal(0)

      // Shows Post Prompt
      node = setupNode({...community,
        memberCount: MIN_MEMBERS_FOR_SKILLS_MODULE - 1,
        postCount: MIN_POSTS_FOR_POST_PROMPT_MODULE})
      expect(node.find('.popular-skills').length).to.equal(0)
      expect(node.find('.post-prompt').length).to.equal(1)

      // Shows either module when minimums are met
      mockify(util, 'coinToss', () => true)
      node = setupNode({...community,
        memberCount: MIN_MEMBERS_FOR_SKILLS_MODULE,
        postCount: MIN_POSTS_FOR_POST_PROMPT_MODULE
      })
      expect(node.find('.popular-skills').length).to.equal(1)
      expect(node.find('.post-prompt').length).to.equal(0)
      unspyify(util, 'coinToss')
      mockify(util, 'coinToss', () => false)
      node = setupNode({...community,
        memberCount: MIN_MEMBERS_FOR_SKILLS_MODULE,
        postCount: MIN_POSTS_FOR_POST_PROMPT_MODULE
      })
      expect(node.find('.popular-skills').length).to.equal(0)
      expect(node.find('.post-prompt').length).to.equal(1)
      unspyify(util, 'coinToss')
    })
  })

  describe('ProfileCompletionModules', () => {
    const setup = (user) => {
      mockActionResponse(updateCurrentUser(), {})
      return setupNode(community, {...currentUser, ...user})
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

require('../support')
import { mount } from 'enzyme'
import React, { PropTypes } from 'react'
import ProfileBioModule from '../../../src/components/ProfileBioModule'

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
  // memberships: {
  //   [community.slug]: {
  //     community_id: community.id,
  //     role: MemberRole.MODERATOR
  //   }
  // }
}

describe('ProfileBioModule', () => {
  // beforeEach(() => {
  //   window.FEATURE_FLAGS = {
  //     REQUEST_TO_JOIN_COMMUNITY: 'on',
  //     COMMUNITY_SETUP_CHECKLIST: 'on'
  //   }
  // })

  it('renders without errors', () => {
    const props = { person: currentUser }

    const node = mount(<ProfileBioModule {...props}/>, {
      context: { dispatch: () => {} },
      childContextTypes: {dispatch: React.PropTypes.func}
    })

    expect(node.find('.profile-bio').length).to.equal(1)
  })
})

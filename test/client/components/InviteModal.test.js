require('../support')
import React from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import { InviteForm } from '../../../src/containers/InviteModal'
import { MemberRole, defaultInvitationSubject, defaultInvitationMessage } from '../../../src/models/community'
import { SEND_COMMUNITY_INVITATION } from '../../../src/constants'

describe('InviteForm', () => {
  var node, mountOpts, store, sendInvitationParams

  const community = {
    id: 1,
    slug: 'coo',
    name: 'Coomunity'
  }

  beforeEach(() => {
    store = configureStore({}).store
    store.oldDispatch = store.dispatch
    store.dispatch = function (action) {
      if (action.type === SEND_COMMUNITY_INVITATION) {
        sendInvitationParams = action.payload.params
      }
      return this.oldDispatch(action)
    }.bind(store)
    const currentUser = {
      memberships: [
        {...community, community_id: 1, role: MemberRole.MODERATOR}
      ]
    }
    mountOpts = {
      context: { store, currentUser },
      childContextTypes: {currentUser: React.PropTypes.object}
    }
    node = mount(<InviteForm community={community}/>, mountOpts)
  })

  it('renders correctly', () => {
    expect(node.find('label').map(l => l.text()))
    .to.deep.equal(['Upload CSV', 'Import CSV File (optional)', ''])
  })

  it('validates emails', () => {
    node.find('.footer a').first().simulate('click')
    expect(node.find('div .alert-danger').first().text())
    .to.equal('Enter at least one email address.')

    node.find('.emails textarea').first().simulate('change', {
      target: {value: 'nogood, bademail'}
    })
    node.find('.footer a').first().simulate('click')
    expect(node.find('div .alert-danger').first().text())
    .to.equal('These emails are invalid: nogood, bademail')
  })

  it('dispatches sendCommunityInvitation with correct params', () => {
    node.find('.emails textarea').first().simulate('change', {
      target: {value: 'a@2.com, b@b.com'}
    })
    node.find('.footer a').first().simulate('click')
    expect(sendInvitationParams).to.deep.equal({
      emails: 'a@2.com,b@b.com',
      subject: defaultInvitationSubject(community.name),
      message: defaultInvitationMessage(community.name),
      moderator: undefined
    })
  })

  describe('with standalone set', () => {
    beforeEach(() => {
      node = mount(<InviteForm community={community} standalone/>, mountOpts)
    })

    it("displays 'skip' link", () => {
      expect(node.find('.footer a').at(1).text()).to.equal('Skip')
    })
  })
})

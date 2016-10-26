require('../support')
import React from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import { InviteForm } from '../../../src/containers/InviteModal'
import { MemberRole } from '../../../src/models/community'

describe.only('InviteForm', () => {
  var node, mountOpts

  const community = {
    id: 1,
    slug: 'coo',
    name: 'Coomunity'
  }

  beforeEach(() => {
    const store = configureStore({}).store
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

  describe('with standalone set', () => {
    beforeEach(() => {
      node = mount(<InviteForm community={community} standalone/>, mountOpts)
    })

    it("displays 'skip' link", () => {
      expect(node.find('.footer a').at(1).text()).to.equal('Skip')
    })
  })
})

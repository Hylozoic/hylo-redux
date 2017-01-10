require('../support')
import { mount } from 'enzyme'
import React from 'react'
import UserSettings from '../../../src/containers/user/UserSettings'
import { configureStore } from '../../../src/store'
import { toggleUserSettingsSection } from '../../../src/actions'

const community = {id: '4', name: 'foomunity', slug: 'foo'}

const currentUser = {
  id: '5',
  is_admin: true,
  memberships: [
    {id: '1', created_at: new Date(), community_id: '4'}
  ]
}

describe('UserSettings', () => {
  it('renders without errors', () => {
    const store = configureStore({
      people: {current: currentUser},
      communities: {[community.id]: community}
    }).store
    const props = {query: {expand: 'communities'}}

    const node = mount(<UserSettings {...props} />, {context: {store}})
    expect(node.find('.section-label').map(n => n.text().trim()))
    .to.deep.equal(['Profile', 'Account', 'Notifications', 'Communities'])

    store.dispatch(toggleUserSettingsSection('communities', true))

    expect(node.find('.communities .section-item label').first().text())
    .to.equal('foomunity')
  })
})

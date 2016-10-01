require('../support')
import { mount } from 'enzyme'
import React from 'react'
import UserSettings from '../../../src/containers/user/UserSettings'
import { configureStore } from '../../../src/store'
import { toggleUserSettingsSection } from '../../../src/actions'

describe('UserSettings', () => {
  it('renders without errors', () => {
    const currentUser = {
      id: '5', is_admin: true,
      memberships: [
        {
          id: '1',
          created_at: new Date(),
          community: {id: '4', name: 'foomunity', slug: 'foo'}
        }
      ]
    }
    const store = configureStore({}).store
    const props = {query: {expand: 'communities'}}

    const node = mount(<UserSettings {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })
    expect(node.find('.section-label').map(n => n.text().trim()))
    .to.deep.equal(['Profile', 'Account', 'Communities'])

    store.dispatch(toggleUserSettingsSection('communities', true))

    expect(node.find('.communities .section-item label').first().text())
    .to.equal('foomunity')
  })
})

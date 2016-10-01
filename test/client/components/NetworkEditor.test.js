require('../support')
import { mount } from 'enzyme'
import React from 'react'
import NetworkEditor from '../../../src/containers/network/NetworkEditor'
import { configureStore } from '../../../src/store'

describe('NetworkEditor', () => {
  before(() => {
    window.FEATURE_FLAGS = {}
  })

  after(() => {
    delete window.FEATURE_FLAGS
  })

  it('renders without errors', () => {
    const currentUser = {id: '5', is_admin: true}
    const store = configureStore({}).store
    const props = {params: {id: 'testing'}}

    const node = mount(<NetworkEditor {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })
    expect(node.find('h2').first().text()).to.equal('Edit network')
  })
})

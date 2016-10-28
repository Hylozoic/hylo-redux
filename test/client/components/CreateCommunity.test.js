require('../support')
import { mount } from 'enzyme'
import React from 'react'
import { CreateCommunity } from '../../../src/containers/CreateCommunity'
import { configureStore } from '../../../src/store'
import { get } from 'lodash/fp'

describe('CreateCommunity', () => {
  var store, node

  beforeEach(() => {
    store = configureStore({}).store
    node = mount(<CreateCommunity/>, {context: {store}})
  })

  it('renders without errors', () => {
    expect(node.find('.modal-topper').text()).to.equal('Your New Community')
    expect(node.find('.create-community label').map(l => l.text()))
    .to.deep.equal(['Community Name', 'URL', 'About your community'])

    node.find('.toggle-section a').first().simulate('click')
    expect(node.find('.create-community label').map(l => l.text()))
    .to.deep.equal([
      'Community Name', 'URL', 'About your community', 'Community Type', 'Location', 'Logo'
    ])
  })

  it('auto generates a slug, and submits without errors', () => {
    node.find('.modal-input').first().find('input[type="text"]').simulate('change', {
      target: {value: 'Real Nice Community'}
    })
    expect(node.find('.modal-input').at(1).find('input[type="text"]').get(0).value)
    .to.equal('real-nice-community')

    node.find('.footer .button').first().simulate('click')
    expect(get('communityEditor.errors', store.getState()))
    .to.deep.equal({ nameBlank: false,
      nameUsed: false,
      slugUsed: false,
      slugBlank: false,
      slugInvalid: false
    })
  })
})

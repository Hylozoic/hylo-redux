require('../support')
import React from 'react'
import { shallow } from 'enzyme'
import ImageModal from '../../../src/containers/ImageModal/component'

describe('ImageModal', () => {
  before(() => {
    document.documentElement.clientWidth = 0
  })

  after(() => {
    document.documentElement.clientWidth = undefined
  })

  it('renders correctly', () => {
    const url = 'http://image.com/image.png'
    const actions = {closeModal: () => {}}
    const node = shallow(<ImageModal url={url} actions={actions} />)
    expect(node.find('img').at(0).props().src).to.equal(url)
  })
})

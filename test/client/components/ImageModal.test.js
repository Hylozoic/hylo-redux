require('../support')
import React from 'react'
import { shallow } from 'enzyme'
import ImageModal from '../../../src/containers/ImageModal.js'

describe('ImageModal', () => {
  before(() => {
    document.documentElement.clientWidth = 0
  })

  after(() => {
    document.documentElement.clientWidth = undefined
  })

  it('renders correctly', () => {
    const url = 'http://image.com/image.png'
    const node = shallow(<ImageModal url={url} />)
    expect(node.find('img').at(0).props().src).to.equal(url)
  })
})

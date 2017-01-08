import '../support'
import { mockify, unspyify } from '../../support/helpers'
import { mount } from 'enzyme'
import React from 'react'
import * as util from '../../../src/util'
import PostPromptModule from '../../../src/components/PostPromptModule'

const setupNode = () => {
  return mount(<PostPromptModule />)
}

describe('PostPromptModule', () => {
  it('should render as expected', () => {
    mockify(util, 'coinToss', () => true)
    let node = setupNode()
    expect(node.html()).to.have.string('#offer')
    unspyify(util, 'coinToss')
    mockify(util, 'coinToss', () => false)
    node = setupNode()
    expect(node.text()).to.have.string('#request')
  })
})

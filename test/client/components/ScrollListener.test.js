require('../support')
import ScrollListener from '../../../src/components/ScrollListener'
import { mount } from 'enzyme'
import React from 'react'
import { spyify, unspyify } from '../../support/helpers'

describe('ScrollListener', () => {
  var onBottom

  beforeEach(() => {
    onBottom = spy(() => {})
    spyify(window, 'addEventListener')
    mount(<ScrollListener onBottom={onBottom}/>)
    document.body.scrollHeight = 5000
    window.innerHeight = 400
  })

  afterEach(() => {
    unspyify(window, 'addEventListener')
  })

  it('does not fire onBottom when the window is not scrolled to the bottom', () => {
    window.pageYOffset = 4349
    window.dispatchEvent(new window.UIEvent('scroll'))
    expect(onBottom).not.to.have.been.called()
  })

  it('fires onBottom when the window is scrolled to the bottom', () => {
    window.pageYOffset = 4351
    window.dispatchEvent(new window.UIEvent('scroll'))
    expect(onBottom).to.have.been.called()
  })
})

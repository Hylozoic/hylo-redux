import '../../support'
import React from 'react'
import { shallow } from 'enzyme'
import { merge } from 'lodash'
import Popover from '../../../../src/components/Popover/component'

const minProps = {
  type: 'tag',
  params: {test1: 'test1'},
  node: {
    removeEventListener: spy(),
    addEventListener: spy(),
    getBoundingClientRect: spy(() => {
      return {top: 45, right: 801, bottom: 249, left: 529, width: 272}
    })
  },
  hidePopover: () => {}
}

function renderComponent (props) {
  return shallow(<Popover {...merge({}, minProps, props)} />)
}

describe('<Popover />', () => {
  it('renders as expected with minimum props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('Connect(TagPopover)').length).to.equal(1)
  })

  it('renders a tag popover', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('Connect(TagPopover)').length).to.equal(1)
  })

  it('renders a person popover', () => {
    const wrapper = renderComponent({type: 'person'})
    expect(wrapper.find('Connect(PersonPopover)').length).to.equal(1)
  })
})

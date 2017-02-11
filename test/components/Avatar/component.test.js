import '../../support'
import React from 'react'
import { shallow } from 'enzyme'
import { merge } from 'lodash'
import Avatar from '../../../src/components/Avatar/component'

const minProps = {
  person: {
    id: 1,
    avatar_url: 'http://foo.com/bar (1).png'
  }
}

function renderComponent (props) {
  return shallow(<Avatar {...merge(minProps, props)} />)
}

describe('<Avatar />', () => {
  it('renders as expected with minimum props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('div.avatar').length).to.equal(1)
    expect(wrapper.find('Link').length).to.equal(1)
  })

  it('shows change image button when showEdit is set', () => {
    const wrapper = renderComponent({showEdit: true})
    expect(wrapper.find('Connect(ChangeImageButton)').length).to.equal(1)
  })

  it('doesn\'t show link when isLink is false', () => {
    const wrapper = renderComponent({isLink: false})
    expect(wrapper.find('Link').length).to.equal(0)
  })

  it('escapes parentheses in image urls', () => {
    const wrapper = renderComponent()
    const expected = `url(http://foo.com/bar \\(1\\).png)`
    expect(wrapper.find('div.avatar').prop('style').backgroundImage)
    .to.equal(expected)
  })

  describe('with showPopover', () => {
    it('sets showPopoverHandler when true', () => {
      const props = {showPopover: true, showPopoverHandler: () => {}}
      const wrapper = renderComponent(props)
      expect(wrapper.find('div.avatar').prop('onMouseOver')).to.equal(props.showPopoverHandler)
    })

    it('doesn\'t set a showPopoverHandler when false', () => {
      const props = {showPopover: false, showPopoverHandler: () => {}}
      const wrapper = renderComponent(props)
      expect(wrapper.find('div.avatar').prop('onMouseOver')).to.equal(null)
    })
  })
})

import '../support'
import React from 'react'
import { shallow } from 'enzyme'
import ImageWithFallback from '../../src/components/ImageWithFallback'

function renderComponent (props) {
  return shallow(<ImageWithFallback {...props} />)
}

describe('<ImageWithFallback />', () => {

  it('will initially display the fallback image', () => {
    const props = {className: 'testClass', preferredSrc: 'src1', fallbackSrc: 'src2'}
    const wrapper = renderComponent(props)
    expect(wrapper.find('img[src="src2"]').length).to.equal(1)
    expect(wrapper.find('.testClass').length).to.equal(1)
  })

  it('will initially insert, but hide the preferred image', () => {
    const props = {preferredSrc: 'src1', fallbackSrc: 'src2'}
    const wrapper = renderComponent(props)
    expect(wrapper.find('img[src="src1"]').length).to.equal(1)
  })

  it('will display the preferred image once it has loaded', () => {
    const props = {preferredSrc: 'src1', fallbackSrc: 'src2'}
    const wrapper = renderComponent(props)
    wrapper.instance().handleImageLoaded()
    expect(wrapper.find('img[src="src1"]').length).to.equal(1)
    expect(wrapper.find('img[src="src2"]').length).to.equal(0)
  })
})

import '../../support'
import React from 'react'
import { shallow } from 'enzyme'
import { merge } from 'lodash'
import ClickCatcher from '../../../src/components/ClickCatcher/component'

const minProps = {
  handleMouseOver: () => {},
  navigate: () => {}
}

function renderComponent (props) {
  return shallow(<ClickCatcher {...merge({}, minProps, props)} />)
}

describe('<ClickCatcher />', () => {
  it('renders as expected with minimum and default props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('span').length).to.equal(1)
  })

  it('passes props provided to element', () => {
    const props = {style: {margin: 0}, 'data-test': 'data-test'}
    const wrapper = renderComponent(props)
    expect(wrapper.find('span').prop('style')).to.deep.equal(props.style)
    expect(wrapper.find('span').prop('data-test')).to.equal('data-test')
  })

  it('triggers handleMouseOver', () => {
    const handleMouseOver = spy()
    const wrapper = renderComponent({ handleMouseOver })
    wrapper.find('span').simulate('mouseover')
    expect(handleMouseOver).to.have.been.called.once
  })

  it('handles mentions and hashtag links')
  // NOTE: Due to a current bug in enzyme in the case of dangerouslySetInnerHTML
  // this test is currently not possible using these tools.
  //
  // ref. https://github.com/airbnb/enzyme/issues/419
  //
  // The below test should work once that bug is resolved:
  //
  // , () => {
  //   const testHtml = '<a href="test-href" data-user-id="test">test</a>'
  //   const navigate = spy()
  //   const props = { navigate, dangerouslySetInnerHTML: {__html: testHtml} }
  //   const wrapper = renderComponent(props)
  //   wrapper.find('span a').simulate('click')
  //   expect(navigate).to.have.been.called.once.with("test-href")
  // })
})

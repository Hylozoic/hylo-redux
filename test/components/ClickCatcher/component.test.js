import '../../support'
import React from 'react'
import { shallow } from 'enzyme'
import { merge } from 'lodash'
import ClickCatcher from '../../../src/components/ClickCatcher/component'

const minProps = {
  onMouseOver: () => {},
  navigate: () => {}
}

function renderComponent (props) {
  return shallow(<ClickCatcher {...merge(minProps, props)} />)
}

describe('<ClickCatcher />', () => {
  it('renders as expected with minimum and default props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('span').length).to.equal(1)
  })

  it('it passes props provided to element', () => {
    const props = {style: 'style', 'data-test': 'data-test'}
    const wrapper = renderComponent(props)
    expect(wrapper.find('span').prop('style')).to.equal('style')
    expect(wrapper.find('span').prop('data-test')).to.equal('data-test')
  })

  it('it triggers onMouseOver')

  it('it handles mentions and hashtag links')
})

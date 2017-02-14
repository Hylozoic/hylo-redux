import '../../support'
import React from 'react'
import { merge } from 'lodash'
import { shallow } from 'enzyme'
import App from '../../../src/containers/App/component'

const minProps = {
  removeNotification: () => {},
  navigate: () => {},
  notify: () => {},
  setMobileDevice: () => {},
  openModals: []
}

function renderComponent (props) {
  return shallow(
    <App {...merge(minProps, props)} />
  )
}

describe('<App />', () => {
  it('renders with minimum props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('div').length).to.equal(1)
  })

  it('renders child content', () => {
    const props = {
      children: <div className='test-content'>Child content is required</div>
    }
    const wrapper = renderComponent(props)
    expect(wrapper.find('div.test-content').length).to.equal(1)
  })

  describe('with popover', () => {
    it('renders when passed', () => {
      const props = {
        popover: {notempty: 'test'}
      }
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(Popover)').length).to.equal(1)
    })

    it('does not render on mobile', () => {
      const props = {
        popover: {notempty: 'test'},
        isMobile: true
      }
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(Popover)').length).to.equal(0)
    })
  })
})

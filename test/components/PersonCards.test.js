import '../support'
import React from 'react'
import { merge } from 'lodash'
import { shallow } from 'enzyme'
import PersonCards from '../../src/components/PersonCards'

const minProps = {
  people: [
    {id: 'test1'},
    {id: 'test2'}
  ]
}

function renderComponent (props) {
  return shallow(<PersonCards {...merge(minProps, props)} />)
}

describe('<PersonCards />', () => {
  it('renders with minimum props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('.person-cards').length).to.equal(1)
  })
})

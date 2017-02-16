import '../support'
import React from 'react'
import { merge } from 'lodash'
import { shallow } from 'enzyme'
import PostDetails from '../../src/components/PostDetails'

const minProps = {
  post: {},
  community: {}
}

const requiredContext = {
  currentUser: {id: 'x'}
}

function renderComponent (props) {
  return shallow(<PostDetails {...merge({}, minProps, props)} />, {context: requiredContext})
}

describe('<PostDetails />', () => {
  it('extracts tags from truncated description text', () => {
    const description = `Please let me know what <a>#software</a> you recommend and i
    can start working on it, and then help me for about an hour to get
    accustomed to the program? It is preferable that the software is free and
    user friendly. Can offer compensation in the form of plants or ca$h. thank
    you!! #permaculture <a>#design</a> #support`
    const props = {post: { description }}
    const wrapper = renderComponent(props)

    expect(wrapper.find('HashtagLink').length).to.equal(3)
    const tags = wrapper.find('HashtagLink').map((node) => node.prop('tag'))
    expect(tags).to.deep.equal(['permaculture', 'design', 'support'])
    expect(wrapper.find('.show-more').length).to.equal(1)
  })
})

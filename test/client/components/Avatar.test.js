require('../support')
import { mount } from 'enzyme'
import React from 'react'
import { configureStore } from '../../../src/store'
import Avatar from '../../../src/components/Avatar'

describe('Avatar', () => {
  const person = {id: 1, avatar_url: 'http://foo.com/bar (1).png'}

  it('escapes parentheses in image urls', () => {
    const expected = 'url(http://foo.com/bar \\(1\\).png)'
    const node = mount(<Avatar person={person} />, {
      context: { dispatch: () => {} },
      childContextTypes: {dispatch: React.PropTypes.func}
    })
    expect(node.find('div').first().props().style.backgroundImage)
    .to.equal(expected)
  })
})

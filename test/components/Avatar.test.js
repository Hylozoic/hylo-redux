import { mocks } from '../support'
import { createElement } from '../support/helpers'
import { renderToString } from 'react-dom/server'
import Avatar from '../../src/components/Avatar'

describe('Avatar', () => {
  const person = {id: 1, avatar_url: 'http://foo.com/bar (1).png'}

  it('escapes parentheses in image urls', () => {
    const expected = 'background-image:url(http://foo.com/bar \\(1\\).png)'
    const store = mocks.redux.store({})
    const component = createElement(Avatar, {person}, {store})
    const node = renderToString(component)
    expect(node).to.include(expected)
  })
})

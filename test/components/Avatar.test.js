import { renderToString } from 'react-dom/server'
import Avatar from '../../src/components/Avatar'
import React from 'react'

describe('Avatar', () => {
  const person = {id: 1, avatar_url: 'http://foo.com/bar (1).png'}

  it('escapes parentheses in image urls', () => {
    const expected = 'background-image:url(http://foo.com/bar \\(1\\).png)'
    const node = renderToString(<Avatar person={person}/>)
    expect(node).to.include(expected)
  })
})

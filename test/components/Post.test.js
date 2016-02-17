import React from 'react'
import { UndecoratedPost } from '../../src/components/Post'
import { createRenderer } from 'react-addons-test-utils'

describe('Post', () => {
  let renderer

  before(() => renderer = createRenderer())

  it('renders a post', () => {
    let post = {
      type: 'intention',
      user: {
        name: 'Neck Face'
      }
    }

    renderer.render(<UndecoratedPost post={post}/>)
    let node = renderer.getRenderOutput()
    expect(node.type).to.equal('div')
    expect(node.props.className).to.equal('post intention')
  })
})

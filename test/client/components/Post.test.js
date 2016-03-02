import { UndecoratedPost } from '../../../src/components/Post'
import Post from '../../../src/components/Post'
import React from 'react'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument,
  Simulate
} from 'react-addons-test-utils'
import { Provider } from 'react-redux'

let post = {
  id: 'p',
  name: 'i have something for you!',
  description: 'it is very special.',
  type: 'offer',
  created_at: new Date(),
  updated_at: new Date(),
  user: {
    id: 'x',
    name: 'Mr. X',
    avatar_url: '/img/mrx.png'
  }
}

let state = {}

let store = {
  getState: () => state,
  subscribe: () => {},
  dispatch: () => {}
}

describe('UndecoratedPost', () => {
  let component, node, expand
  before(() => {
    expand = spy(() => {})
    component = <UndecoratedPost post={post} onExpand={expand}/>
    node = renderIntoDocument(component)
  })

  it('renders', () => {
    findRenderedDOMComponentWithClass(node, 'post offer')
    let title = findRenderedDOMComponentWithClass(node, 'title')
    expect(title.innerHTML).to.equal(post.name)
  })

  it('calls onExpand on click', () => {
    let outerDiv = findRenderedDOMComponentWithClass(node, 'post offer')
    Simulate.click(outerDiv)
    expect(expand).to.have.been.called()
  })
})

describe('Post', () => {
  it('renders expanded', () => {
    let component = <Provider store={store}>
      <Post post={post} expanded={true}/>
    </Provider>
    let node = renderIntoDocument(component)
    findRenderedDOMComponentWithClass(node, 'post offer expanded')
  })
})

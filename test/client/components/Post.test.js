require('../support')
import { mocks, helpers } from '../../support'
import Post from '../../../src/components/Post'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'

let post = {
  id: 'p',
  name: 'i have &quot;something&quot; for you!',
  description: 'it is very special.',
  type: 'offer',
  tag: 'offer',
  created_at: new Date(),
  updated_at: new Date(),
  user: {
    id: 'x',
    name: 'Mr. X',
    avatar_url: '/img/mrx.png'
  },
  communities: ['f']
}

let communities = [
  {id: 'f', name: 'Foomunity'}
]

let state = {
  communities: {
    f: communities[0]
  },
  people: {
    current: {
      id: 'x',
      name: 'Mr. X',
      avatar_url: '/img/mrx.png'
    }
  }
}

describe('Post', () => {
  it('renders expanded', () => {
    const props = {post, expanded: true}
    const store = mocks.redux.store(state)
    const context = {store, dispatch: store.dispatch}
    let component = helpers.createElement(Post, props, context)
    let node = renderIntoDocument(component)
    findRenderedDOMComponentWithClass(node, 'post')
    let details = findRenderedDOMComponentWithClass(node, 'details')
    let expected = new RegExp(`<span[^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>`)
    expect(details.innerHTML).to.match(expected)
    let title = findRenderedDOMComponentWithClass(node, 'title')
    expect(title.innerHTML).to.equal('i have "something" for you!')
  })
})

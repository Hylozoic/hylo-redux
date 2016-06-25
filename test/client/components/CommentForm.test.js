require('../support')
import { mocks, helpers } from '../../support'
import ConnectedPostList from '../../../src/containers/ConnectedPostList'
import {
  findRenderedDOMComponentWithClass,
  findRenderedDOMComponentWithTag,
  renderIntoDocument,
  Simulate
} from 'react-addons-test-utils'
const { click, change } = Simulate

describe('CommentForm', () => {
  describe('in ConnectedPostList', () => {
    let community = {id: '1', name: 'Foomunity', slug: 'foo'}

    let currentUser = {
      id: 'x',
      name: 'Mr. X',
      avatar_url: '/img/mrx.png'
    }

    let state = {
      communities: {
        [community.slug]: community
      },
      people: {
        current: currentUser
      },
      posts: {
        '1': {
          id: '1', name: 'post', type: 'offer',
          user: {id: 1, name: 'jo', avatar_url: ''},
          communities: [community],
          description: '<p>A long enough description that the show more button is displayed.</p>' +
            '<p>A long enough description that the show more button is displayed.</p>' +
            '<p>A long enough description that the show more button is displayed.</p>' +
            '<p>A long enough description that the show more button is displayed.</p>' +
            '<p>A long enough description that the show more button is displayed.</p>' +
            '<p>A long enough description that the show more button is displayed.</p>'
        }
      },
      totalPostsByQuery: {'subject=community&id=foo': 1},
      postsByQuery: {'subject=community&id=foo': [1]},
      pending: {}
    }

    it.only('retains comment data after blur', () => {
      const props = {subject: 'community', id: 'foo'}
      const store = mocks.redux.store(state)
      const context = {store, community, currentUser}
      const commentText = 'the partially written comment'
      let component = helpers.createElement(ConnectedPostList, props, context)
      let node = renderIntoDocument(component).getWrappedInstance()
      let showMoreButton = findRenderedDOMComponentWithClass(node, 'show-more')
      click(showMoreButton)
      let placeholder = findRenderedDOMComponentWithClass(node, 'content placeholder')
      click(placeholder)
      let textArea = findRenderedDOMComponentWithTag(node, 'textarea')
      textArea.value = commentText
      change(textArea)
      let backdrop = findRenderedDOMComponentWithClass(node, 'backdrop')
      click(backdrop)
      showMoreButton = findRenderedDOMComponentWithClass(node, 'show-more')
      click(showMoreButton)
      placeholder = findRenderedDOMComponentWithClass(node, 'content placeholder')
      click(placeholder)
      textArea = findRenderedDOMComponentWithTag(node, 'textarea')
      expect(textArea.value).to.equal(commentText)
    })
  })
})

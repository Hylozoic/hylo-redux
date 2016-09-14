require('../support')
import { mocks, helpers } from '../../support'
import ConnectedPostList from '../../../src/containers/ConnectedPostList'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'

describe('ConnectedPostList', () => {
  describe('with freshCount', () => {
    let community = {id: '1', name: 'Foomunity', slug: 'foo'}

    let state = {
      communities: {
        [community.slug]: community
      },
      people: {
        current: {
          id: 'x',
          name: 'Mr. X',
          avatar_url: '/img/mrx.png'
        },
        '1': {id: 1, name: 'jo', avatar_url: ''}
      },
      posts: {1: {
        id: 1, name: 'post', description: 'ra', type: 'offer',
        user_id: '1',
        community_ids: [community.id]
      }},
      totalPostsByQuery: {'subject=community&id=foo': 1},
      postsByQuery: {'subject=community&id=foo': [1]},
      pending: {},
      countFreshPostsByQuery: {
        'subject=community&id=foo': 3
      }
    }

    it('displays new post notification', () => {
      const props = {subject: 'community', id: 'foo'}
      const store = mocks.redux.store(state)
      const context = {store, community}
      let component = helpers.createElement(ConnectedPostList, props, context)
      let node = renderIntoDocument(component).getWrappedInstance()
      let refreshButton = findRenderedDOMComponentWithClass(node, 'refresh-button')
      expect(refreshButton.innerHTML).to.equal('3 new posts')
    })
  })
})

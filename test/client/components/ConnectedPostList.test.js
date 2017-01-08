import '../support'
import React, { PropTypes } from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import { reduce } from 'lodash'
import ConnectedPostList from '../../../src/containers/ConnectedPostList'
import PostPromptModule from '../../../src/components/PostPromptModule'

let community = {
  id: '1',
  name: 'Foomunity',
  slug: 'foo'
}

let posts = [
  {
    id: 1,
    name: 'post 1',
    description: 'ra',
    type: 'offer',
    user_id: '1',
    community_ids: [community.id]
  },
  {
    id: 2,
    name: 'post 2',
    description: 'ra',
    type: 'request',
    user_id: '1',
    community_ids: [community.id]
  },
  {
    id: 3,
    name: 'post 3',
    description: 'ra',
    type: null,
    user_id: '1',
    community_ids: [community.id]
  }
]

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
  posts: reduce(posts, (result, value) => {
    result[value.id] = value
    return result
  }, {}),
  typeaheadMatches: {
    invite: [
      {id: 'x', name: 'author of post fixture'},
      {id: 'y', name: 'a contributing user'}
    ]
  },
  totalPostsByQuery: {'subject=community&id=foo': 3},
  postsByQuery: {'subject=community&id=foo': [1,2,3]},
  pending: {},
  countFreshPostsByQuery: {'subject=community&id=foo': 3}
}

const setupNode = (setupProps) => {
  const store = configureStore(state).store
  const props = {
    subject: 'community',
    id: 'foo',
    ...setupProps
  }
  return mount(<ConnectedPostList {...props} />, {
    context: {store, dispatch: store.dispatch},
    childContextTypes: {dispatch: PropTypes.func}
  })
}

describe('ConnectedPostList', () => {
  describe('with freshCount', () => {
    it('displays new post notification', () => {
      const node = setupNode()
      expect(node.find('.refresh-button').text()).to.equal('3 new posts')
    })
  })

  it('includes a module when provided', () => {
    const node = setupNode({
      module: {
        id: -1,
        type: 'module',
        component: <PostPromptModule />
      }
    })
    expect(node.find(PostPromptModule).length).to.equal(1)
  })
})

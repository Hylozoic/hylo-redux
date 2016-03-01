require('../support')
import { connectedListProps, fetchWithCache } from '../../src/util/caching'
import { FETCH_POSTS } from '../../src/actions'

describe('connectedListProps', () => {
  it('assembles props from store', () => {
    let state = {
      posts: {
        'a': {id: 'a'},
        'b': {id: 'b'},
        'c': {id: 'c'}
      },
      postsByQuery: {
        'subject=foo&id=bar&search=baz': ['a', 'c']
      },
      totalPostsByQuery: {
        'subject=foo&id=bar&search=baz': 20
      },
      pending: {
        [FETCH_POSTS]: true
      }
    }

    let props = {
      subject: 'foo',
      id: 'bar',
      query: {search: 'baz'}
    }

    let expectedProps = {
      posts: [{id: 'a'}, {id: 'c'}],
      total: 20,
      pending: true,
      newPosts: false
    }

    expect(connectedListProps(state, props, 'posts')).to.deep.equal(expectedProps)
  })
})

describe('fetchWithCache', () => {
  it('creates an action', () => {
    let mockActionCreator = function (payload) {
      return {type: 'MOCK', payload}
    }

    let expectedAction = {
      type: 'MOCK',
      payload: {
        subject: 'subject',
        id: 1,
        search: 'foo',
        type: 'weird',
        limit: 20,
        cacheId: 'subject=subject&id=1&type=weird&search=foo'
      }
    }

    let action = fetchWithCache(mockActionCreator)('subject', 1, {search: 'foo', type: 'weird'})

    expect(action).to.deep.equal(expectedAction)
  })
})

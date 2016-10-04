require('../support')
import postsByQuery from '../../src/reducers/postsByQuery'
import { CREATE_POST, FETCH_POSTS } from '../../src/actions'

describe('postsByQuery', () => {
  describe('on FETCH_POSTS', () => {
    it('adds post ids to a subtree named after cache id', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'a'}, {id: 'b'}],
          posts_total: 5
        },
        meta: {
          cache: {id: 'bar'}
        }
      }

      let state = {
        foo: ['a', 'c']
      }

      let expectedState = {
        foo: ['a', 'c'],
        bar: ['a', 'b']
      }

      expect(postsByQuery(state, action)).to.deep.equal(expectedState)
    })

    it('removes duplicates', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'y'}, {id: 'z'}, {id: 'w'}],
          posts_total: 5
        },
        meta: {
          cache: {id: 'foo'}
        }
      }

      let state = {
        foo: ['x', 'y']
      }

      let expectedState = {
        foo: ['x', 'y', 'z', 'w']
      }

      expect(postsByQuery(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on CREATE_POST', () => {
    it('prepends the post to caches', () => {
      let post = {
        id: 'p',
        user: {id: '1'},
        communities: [{slug: 'foo'}, {slug: 'bar'}],
        tag: 'sometag'
      }

      let action = {
        type: CREATE_POST,
        payload: post,
        meta: {
          tags: ['suchtag']
        }
      }

      let state = {
        'subject=all-posts': ['a'],
        'subject=community&id=foo': ['b'],
        'subject=community&id=bar': ['c'],
        'subject=community&id=baz': ['d'],
        'subject=person&id=1': ['e'],
        'subject=community&id=all&tag=sometag': ['f'],
        'subject=community&id=bar&tag=sometag': ['g'],
        'subject=community&id=all&tag=othertag': ['h'],
        'subject=community&id=bar&tag=othertag': ['i'],
        'subject=community&id=bar&tag=suchtag': ['j']
      }

      let expectedState = {
        'subject=all-posts': ['p', 'a'],
        'subject=community&id=foo': ['p', 'b'],
        'subject=community&id=bar': ['p', 'c'],
        'subject=community&id=baz': ['d'],
        'subject=person&id=1': ['p', 'e'],
        'subject=community&id=all&tag=sometag': ['p', 'f'],
        'subject=community&id=bar&tag=sometag': ['p', 'g'],
        'subject=community&id=all&tag=othertag': ['h'],
        'subject=community&id=bar&tag=othertag': ['i'],
        'subject=community&id=bar&tag=suchtag': ['p', 'j']
      }

      expect(postsByQuery(state, action)).to.deep.equal(expectedState)
    })
  })
})

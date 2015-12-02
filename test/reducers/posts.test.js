require('../support')
import posts from '../../src/reducers/posts'
import { FETCH_POSTS } from '../../src/actions/fetchPosts'

describe('posts', () => {
  describe('on FETCH_POSTS', () => {
    it('normalizes community data', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'a', name: 'hi', communities: [{id: 'c1'}, {id: 'c2'}]}]
        },
        meta: {
          cache: {id: 'foo'}
        }
      }

      let state = {}

      let expectedState = {
        a: {id: 'a', name: 'hi', communities: ['c1', 'c2']}
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })
  })
})

require('../support')
import postsByQuery from '../../src/reducers/postsByQuery'
import { CREATE_POST } from '../../src/actions'
import { FETCH_POSTS } from '../../src/actions/fetchPosts'

describe('postsByQuery', () => {
  describe('on FETCH_POSTS', () => {
    it('adds posts to a subtree named after cache id', () => {
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
        foo: [{id: 'a'}, {id: 'c'}]
      }

      let expectedState = {
        foo: [{id: 'a'}, {id: 'c'}],
        bar: [{id: 'a'}, {id: 'b'}]
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
        foo: [{id: 'x'}, {id: 'y'}]
      }

      let expectedState = {
        foo: [{id: 'x'}, {id: 'y'}, {id: 'z'}, {id: 'w'}]
      }

      expect(postsByQuery(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on CREATE_POST', () => {
    it('prepends the post to caches', () => {
      let post = {
        id: '5',
        user_id: '1',
        communities: [{slug: 'foo'}, {slug: 'bar'}]
      }

      let action = {type: CREATE_POST, payload: post}

      let state = {
        'subject=all-posts': [{id: 6}],
        'subject=community&id=foo': [{id: 7}],
        'subject=community&id=bar': [{id: 8}],
        'subject=community&id=baz': [{id: 9}],
        'subject=person&id=1': [{id: 10}]
      }

      let expectedState = {
        'subject=all-posts': [post, {id: 6}],
        'subject=community&id=foo': [post, {id: 7}],
        'subject=community&id=bar': [post, {id: 8}],
        'subject=community&id=baz': [{id: 9}],
        'subject=person&id=1': [post, {id: 10}]
      }

      expect(postsByQuery(state, action)).to.deep.equal(expectedState)
    })
  })
})

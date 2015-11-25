require('../support')
import postsByQuery from '../../src/reducers/postsByQuery'
import { FETCH_POSTS } from '../../src/actions'

describe('postsByQuery', () => {
  it('adds posts to a subtree named after id', () => {
    let action = {
      type: FETCH_POSTS,
      payload: {
        posts: [{id: 'a'}, {id: 'b'}],
        posts_total: 5
      },
      meta: {
        query: 'bar'
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
        query: 'foo'
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

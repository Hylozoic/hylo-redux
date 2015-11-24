require('../index')
import postsByCommunity from '../../src/reducers/postsByCommunity'
import { FETCH_POSTS } from '../../src/actions'

describe('postsByCommunity', () => {
  it('appends posts to existing ones, removing duplicates', () => {
    let action = {
      type: FETCH_POSTS,
      payload: {
        posts: [
          {id: 'y'},
          {id: 'z'},
          {id: 'w'}
        ],
        posts_total: 5
      },
      meta: {
        id: 'foo',
        subject: 'community'
      }
    }

    let state = {
      foo: [
        {id: 'x'},
        {id: 'y'}
      ]
    }

    let expectedState = {
      foo: [
        {id: 'x'},
        {id: 'y'},
        {id: 'z'},
        {id: 'w'}
      ]
    }

    expect(postsByCommunity(state, action)).to.deep.equal(expectedState)
  })
})

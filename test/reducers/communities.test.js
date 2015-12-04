require('../support')
import communities from '../../src/reducers/communities'
import { FETCH_POST, FETCH_POSTS, FETCH_CURRENT_USER } from '../../src/actions'

const post1 = {
  id: 'a',
  name: 'hi',
  communities: [
    {id: 'c1', slug: 'c1'},
    {id: 'c2', slug: 'c2'}
  ]
}

const post2 = {
  id: 'b',
  name: 'hi',
  communities: [
    {id: 'c3', slug: 'c3'},
    {id: 'c4', slug: 'c4'}
  ]
}

describe('communities', () => {
  describe('on FETCH_POST', () => {
    it('normalizes community data', () => {
      let action = {
        type: FETCH_POST,
        payload: post1
      }

      let state = {
        c1: {id: 'c1', slug: 'old'},
        c3: {id: 'c3', slug: 'c3'}
      }

      let expectedState = {
        c1: {id: 'c1', slug: 'c1'},
        c2: {id: 'c2', slug: 'c2'},
        c3: {id: 'c3', slug: 'c3'}
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on FETCH_CURRENT_USER', () => {
    it('normalizes community data', () => {
      let action = {
        type: FETCH_CURRENT_USER,
        payload: {
          id: 1,
          memberships: [
            {community: {id: 'c1', slug: 'c1'}},
            {community: {id: 'c2', slug: 'c2'}}
          ]
        }
      }

      let state = {
        c1: {id: 'c1', slug: 'old'},
        c3: {id: 'c3', slug: 'c3'}
      }

      let expectedState = {
        c1: {id: 'c1', slug: 'c1'},
        c2: {id: 'c2', slug: 'c2'},
        c3: {id: 'c3', slug: 'c3'}
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on FETCH_POSTS', () => {
    it('normalizes community data', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {posts: [post1, post2]}
      }

      let state = {
        c1: {id: 'c1', slug: 'old'},
        c4: {id: 'c4', slug: 'c4', hello: 'world'},
        c5: {id: 'c5', slug: 'c5'}
      }

      let expectedState = {
        c1: {id: 'c1', slug: 'c1'},
        c2: {id: 'c2', slug: 'c2'},
        c3: {id: 'c3', slug: 'c3'},
        c4: {id: 'c4', slug: 'c4', hello: 'world'},
        c5: {id: 'c5', slug: 'c5'}
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })
})

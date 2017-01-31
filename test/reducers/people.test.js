require('../support')
import people from '../../src/reducers/people'
import { filter } from 'lodash'
import {
  FETCH_PEOPLE,
  LEAVE_COMMUNITY_PENDING,
  UPDATE_CURRENT_USER_PENDING
} from '../../src/actions/constants'

const user1 = {
  id: 'j',
  name: 'Joe',
  email: 'joe@foo.com',
  memberships: [{community_id: 1}, {community_id: 2}, {community_id: 3}],
  tags: ['foo', 'bar', 'baz']
}

describe('people', () => {
  describe('on LEAVE_COMMUNITY_PENDING', () => {
    it('removes the membership from current user', () => {
      let action = {
        type: LEAVE_COMMUNITY_PENDING,
        meta: {id: 3}
      }

      let state = {
        current: user1
      }

      let expectedState = {
        current: {...user1, memberships: filter(user1.memberships, m => m.community_id !== 3)}
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on UPDATE_CURRENT_USER_PENDING', () => {
    it('updates the current user', () => {
      let action = {
        type: UPDATE_CURRENT_USER_PENDING,
        meta: {params: {email: 'joe@bar.com'}}
      }

      let state = {current: user1}

      let expectedState = {
        current: {...user1, email: 'joe@bar.com'}
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })

    it('adds tags', () => {
      const action = {
        type: UPDATE_CURRENT_USER_PENDING,
        meta: {params: {tags: ['foo', 'bar', 'baz', 'klunk']}}
      }

      const state = {current: user1}

      const expected = {
        current: {...user1, tags: ['foo', 'bar', 'baz', 'klunk']}
      }

      expect(people(state, action)).to.deep.equal(expected)
    })

    it('removes tags', () => {
      const action = {
        type: UPDATE_CURRENT_USER_PENDING,
        meta: {params: {tags: ['foo', 'bar']}}
      }

      const state = {current: user1}

      const expected = {
        current: {...user1, tags: ['foo', 'bar']}
      }

      const newState = people(state, action)
      expect(newState).to.deep.equal(expected)
      expect(newState.current).not.to.equal(state.current)
    })
  })

  describe('on FETCH_PEOPLE', () => {
    it('merges existing props with new ones', () => {
      let action = {
        type: FETCH_PEOPLE,
        payload: {
          items: [
            {id: 'a', foo: 'b', bar: 'c'}
          ]
        }
      }

      let state = {
        a: {id: 'a', foo: 'b', baz: 'd'},
        current: null
      }

      let expectedState = {
        a: {id: 'a', foo: 'b', bar: 'c', baz: 'd'},
        current: null
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })
})

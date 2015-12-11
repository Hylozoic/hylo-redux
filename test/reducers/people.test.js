require('../support')
import people from '../../src/reducers/people'
import { slice, filter } from 'lodash'
import { LEAVE_COMMUNITY, LEAVE_COMMUNITY_PENDING, UPDATE_USER_SETTINGS, UPDATE_USER_SETTINGS_PENDING } from '../../src/actions'

const user1 = {
  name: 'Joe',
  email: 'joe@foo.com',
  memberships: [{community_id: 1}, {community_id: 2}, {community_id: 3}]
}

describe('people', () => {
  describe('on LEAVE_COMMUNITY with error', () => {
    it('restores current user to previous state', () => {
      let action = {
        type: LEAVE_COMMUNITY,
        error: true,
        meta: {prevProps: user1}
      }

      let state = {
        current: {...user1, memberships: slice(user1.memberships, 0, 2)}
      }

      let expectedState = {
        current: user1
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on UPDATE_USER_SETTINGS with error', () => {
    it('restores current user to previous state', () => {
      let action = {
        type: UPDATE_USER_SETTINGS,
        error: true,
        meta: {prevProps: user1}
      }

      let state = {
        current: {...user1, email: 'joe@bar.com'}
      }

      let expectedState = {
        current: user1
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on LEAVE_COMMUNITY_PENDING', () => {
    it('removes the membership from current user', () => {
      let action = {
        type: LEAVE_COMMUNITY_PENDING,
        meta: {communityId: 3}
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

  describe('on UPDATE_USER_SETTINGS_PENDING', () => {
    it('updates the current user', () => {
      let action = {
        type: UPDATE_USER_SETTINGS_PENDING,
        meta: {params: {email: 'joe@bar.com'}}
      }

      let state = {
        current: user1
      }

      let expectedState = {
        current: {...user1, email: 'joe@bar.com'}
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })
})

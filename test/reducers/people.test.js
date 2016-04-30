require('../support')
import people from '../../src/reducers/people'
import { slice, filter } from 'lodash'
import {
  FETCH_PEOPLE,
  LEAVE_COMMUNITY,
  LEAVE_COMMUNITY_PENDING,
  UPDATE_USER_SETTINGS,
  UPDATE_USER_SETTINGS_PENDING
} from '../../src/actions'

const user1 = {
  id: 'j',
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
        meta: {
          id: 'j',
          prevProps: {
            settings: {digest_frequency: 'weekly'},
            name: 'Joe!'
          }
        }
      }

      let state = {
        current: {
          id: 'j',
          email: 'joe@bar.com',
          settings: {digest_frequency: 'daily', receives_email_prompts: true}
        },
        j: {
          id: 'j',
          email: 'joe@bar.com',
          settings: {digest_frequency: 'daily', receives_email_prompts: true}
        }
      }

      let expectedState = {
        current: {
          id: 'j',
          email: 'joe@bar.com',
          settings: {digest_frequency: 'weekly', receives_email_prompts: true},
          name: 'Joe!'
        },
        j: {
          id: 'j',
          email: 'joe@bar.com',
          settings: {digest_frequency: 'weekly', receives_email_prompts: true},
          name: 'Joe!'
        }
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
        meta: {id: user1.id, params: {email: 'joe@bar.com'}}
      }

      let state = {
        current: user1,
        [user1.id]: user1
      }

      let expectedState = {
        current: {...user1, email: 'joe@bar.com'},
        [user1.id]: {...user1, email: 'joe@bar.com'}
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on FETCH_PEOPLE', () => {
    it('merges existing props with new ones', () => {
      let action = {
        type: FETCH_PEOPLE,
        payload: {
          people: [
            {id: 'a', foo: 'b', bar: 'c'}
          ]
        }
      }

      let state = {
        a: {id: 'a', foo: 'b', baz: 'd'}
      }

      let expectedState = {
        a: {id: 'a', foo: 'b', bar: 'c', baz: 'd'}
      }

      expect(people(state, action)).to.deep.equal(expectedState)
    })
  })
})

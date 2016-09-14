require('../support')
import communities from '../../src/reducers/communities'
import {
  FETCH_CURRENT_USER,
  ADD_COMMUNITY_MODERATOR_PENDING,
  REMOVE_COMMUNITY_MODERATOR_PENDING,
  UPDATE_COMMUNITY_SETTINGS_PENDING,
  USE_INVITATION
} from '../../src/actions'

const community1 = {
  id: 'c1',
  slug: 'c1',
  name: 'Current Name',
  moderators: []
}

describe('communities', () => {
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

  describe('on UPDATE_COMMUNITY_SETTINGS_PENDING', () => {
    it('updates the community in the store', () => {
      let action = {
        type: UPDATE_COMMUNITY_SETTINGS_PENDING,
        meta: {
          slug: 'c1',
          params: {
            name: 'New Name',
            settings: {all_can_invite: true}
          }
        }
      }

      let state = {
        c1: {
          slug: 'c1',
          intention: 'Intention.',
          settings: {post_prompt_day: 0}
        }
      }

      let expectedState = {
        c1: {
          slug: 'c1',
          name: 'New Name',
          intention: 'Intention.',
          settings: {post_prompt_day: 0, all_can_invite: true}
        }
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on ADD_COMMUNITY_MODERATOR_PENDING', () => {
    it('updates the community in the store', () => {
      let action = {
        type: ADD_COMMUNITY_MODERATOR_PENDING,
        meta: {moderator: {name: 'Joe Mod'}, slug: 'c1'}
      }

      let state = {
        c1: community1
      }

      let expectedState = {
        c1: {...community1, moderators: [{name: 'Joe Mod'}]}
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on REMOVE_COMMUNITY_MODERATOR_PENDING', () => {
    it('updates the community in the store', () => {
      let action = {
        type: REMOVE_COMMUNITY_MODERATOR_PENDING,
        meta: {moderatorId: 2, slug: 'c1'}
      }

      let state = {
        c1: {...community1, moderators: [{name: 'Joe Mod', id: 1}, {name: 'Sue Mod', id: 2}]}
      }

      let expectedState = {
        c1: {...community1, moderators: [{name: 'Joe Mod', id: 1}]}
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on USE_INVITATION', () => {
    it('adds the community indexed by both token and slug, preserving existing values', () => {
      const token = 'abcdef'
      let updatedCommunity1 = {slug: community1.slug, newval: 'a new value'}
      let action = {
        type: USE_INVITATION,
        meta: {token},
        payload: {
          community: updatedCommunity1
        }
      }
      let state = {
        [community1.slug]: community1
      }

      let expectedState = {
        [community1.slug]: {...community1, ...updatedCommunity1},
        [token]: updatedCommunity1
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })
})

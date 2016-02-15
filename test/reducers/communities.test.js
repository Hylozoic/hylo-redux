require('../support')
import communities from '../../src/reducers/communities'
import {
  FETCH_POST,
  FETCH_POSTS,
  FETCH_CURRENT_USER,
  UPDATE_COMMUNITY_SETTINGS,
  ADD_COMMUNITY_MODERATOR,
  ADD_COMMUNITY_MODERATOR_PENDING,
  REMOVE_COMMUNITY_MODERATOR,
  REMOVE_COMMUNITY_MODERATOR_PENDING,
  UPDATE_COMMUNITY_SETTINGS_PENDING
} from '../../src/actions'

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

const community1 = {
  id: 'c1',
  slug: 'c1',
  name: 'Current Name',
  moderators: []
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

  describe('on UPDATE_COMMUNITY_SETTINGS with error', () => {
    it('restores current community to previous state', () => {
      let action = {
        type: UPDATE_COMMUNITY_SETTINGS,
        error: true,
        meta: {prevProps: community1, slug: community1.slug}
      }

      let state = {
        [community1.slug]: {...community1, name: 'New Name'}
      }

      let expectedState = {
        [community1.slug]: community1
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on ADD_COMMUNITY_MODERATOR with error', () => {
    it('restores current community to previous state', () => {
      let action = {
        type: ADD_COMMUNITY_MODERATOR,
        error: true,
        meta: {prevProps: community1, slug: community1.slug}
      }

      let state = {
        [community1.slug]: {...community1, name: 'Goal', moderators: [{name: 'Joe Mod'}]}
      }

      let expectedState = {
        [community1.slug]: community1
      }

      expect(communities(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on REMOVE_COMMUNITY_MODERATOR with error', () => {
    it('restores current community to previous state', () => {
      let prevCommunity = {...community1, moderators: [{name: 'Joe Mod'}]}

      let action = {
        type: REMOVE_COMMUNITY_MODERATOR,
        error: true,
        meta: {prevProps: prevCommunity, slug: community1.slug}
      }

      let state = {
        [community1.slug]: community1
      }

      let expectedState = {
        [community1.slug]: prevCommunity
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
          settings: {sends_email_prompts: true}
        }
      }

      let expectedState = {
        c1: {
          slug: 'c1',
          name: 'New Name',
          intention: 'Intention.',
          settings: {sends_email_prompts: true, all_can_invite: true}
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
})

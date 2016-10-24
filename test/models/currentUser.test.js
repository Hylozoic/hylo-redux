import { isMember, isTester, canInvite } from '../../src/models/currentUser'
import { MemberRole } from '../../src/models/community'

describe('currentUser', () => {
  describe('.isMember', () => {
    it('returns true if the user has a membership', () => {
      let community = {id: 'bar'}

      let user = {
        memberships: [
          {community_id: 'foo'},
          {community_id: 'bar'}
        ]
      }

      expect(isMember(user, community)).to.be.true
    })
  })

  describe('.canInvite', () => {
    it('returns true if the user is a moderator', () => {
      let community = {id: 'bar'}

      let user = {
        memberships: [
          {community_id: 'foo'},
          {community_id: 'bar', role: MemberRole.MODERATOR}
        ]
      }

      expect(canInvite(user, community)).to.be.true
    })

    it('returns true if the user is a member and the community has "all_can_invite" enabled', () => {
      let community = {id: 'bar', settings: {all_can_invite: true}}
      let user = {
        memberships: [
          {community_id: 'bar'}
        ]
      }

      expect(canInvite(user, community)).to.be.true
    })
  })

  describe('.isTester', () => {
    it('returns true if the user is in a community with test feature access', () => {
      const u1 = {
        memberships: [{community_id: 1}, {community_id: 39}]
      }
      const u2 = {
        memberships: [{community_id: 1}, {community_id: 1972}]
      }

      expect(isTester(u1)).to.be.true
      expect(isTester(u2)).to.be.true
    })
  })
})

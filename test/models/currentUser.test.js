import '../support'
import {
  canCommentOnPost,
  canModerate,
  isMember,
  isTester,
  canInvite,
  hasBio,
  hasSkills,
  hasFeature
} from '../../src/models/currentUser'
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
    it('is true if the user is a moderator', () => {
      let community = {id: 'bar'}
      let user = {
        memberships: [
          {community_id: 'foo'},
          {community_id: 'bar', role: MemberRole.MODERATOR}
        ]
      }

      expect(canInvite(user, community)).to.be.true
    })

    it('is true if the user is a member and the community has "all_can_invite" enabled', () => {
      let community = {id: 'bar', settings: {all_can_invite: true}}
      let user = {
        memberships: [
          {community_id: 'bar'}
        ]
      }

      expect(canInvite(user, community)).to.be.true
    })

    it('is false if there is no community', () => {
      const user = {memberships: [{community_id: 'bar'}], is_admin: true}
      expect(canInvite(user, null)).to.be.false
    })
  })

  describe('.canModerate', () => {
    it('is true if the user is a moderator', () => {
      const user = {memberships: [{community_id: 'bar', role: MemberRole.MODERATOR}]}
      expect(canModerate(user, {id: 'bar'})).to.be.true
    })

    it('is false if the user is not a moderator', () => {
      const user = {memberships: [{community_id: 'bar', role: MemberRole.DEFAULT}]}
      expect(canModerate(user, {id: 'bar'})).to.be.false
    })

    it('is false if the user is not a member', () => {
      const user = {memberships: [{community_id: 'foo', role: MemberRole.MODERATOR}]}
      expect(canModerate(user, {id: 'bar'})).to.be.false
    })

    it('is false if there is no community', () => {
      const user = {memberships: [{community_id: 'bar'}], is_admin: true}
      expect(canModerate(user, null)).to.be.false
    })
  })

  describe('.isTester', () => {
    it('returns true if the user is in a community with test feature access', () => {
      const u1 = {
        memberships: [{community_id: '1'}, {community_id: '29'}]
      }
      const u2 = {
        memberships: [{community_id: '1'}, {community_id: '1972'}]
      }

      expect(isTester(u1)).to.be.true
      expect(isTester(u2)).to.be.true
    })
  })

  describe('.canCommentOnPost', () => {
    it('is true if the user is a follower', () => {
      expect(canCommentOnPost({id: 1}, {follower_ids: [1, 8]})).to.be.true
    })

    it('is true if the user is in one of the post\'s communities', () => {
      const user = {id: 1, memberships: [{community_id: 2}]}
      expect(canCommentOnPost(user, {community_ids: [5, 2]})).to.be.true
    })

    it('is falsey if no post is provided', () => {
      const user = {id: 1, memberships: [{community_id: 2}]}
      expect(canCommentOnPost(user, null)).to.be.falsey
    })

    it('is falsey if no user is provided', () => {
      expect(canCommentOnPost(null, {follower_ids: [4]})).to.be.falsey
    })

    it('is false otherwise', () => {
      const user = {id: 1, memberships: [{community_id: 2}]}
      const post = {community_ids: [5, 3], follower_ids: [3, 7]}
      expect(canCommentOnPost(user, post)).to.be.false
    })
  })

  describe('.hasBio', () => {
    it('should be falsey when there is an undefined, null or empty bio', () => {
      let user = {}
      expect(hasBio(user)).to.be.falsey
      user = {bio: null}
      expect(hasBio(user)).to.be.falsey
      user = {bio: ''}
      expect(hasBio(user)).to.be.falsey
    })

    it('should be true when there is bio text', () => {
      const user = {bio: 'bio'}
      expect(hasBio(user)).to.be.falsey
    })
  })

  describe('.hasSkills', () => {
    it('should be falsey when tags (skills) are undefined, null or blank', () => {
      let user = {}
      expect(hasSkills(user)).to.be.falsey
      user = {tags: null}
      expect(hasSkills(user)).to.be.falsey
      user = {tags: []}
      expect(hasSkills(user)).to.be.falsey
    })

    it('should be true when are any tags (skills)', () => {
      const user = {tags: ['hacksack']}
      expect(hasSkills(user)).to.be.true
    })
  })

  describe('.hasFeature', () => {
    describe('with a feature flag set to "on"', () => {
      before(() => { process.env.FEATURE_FLAG_FOO = 'on' })
      after(() => delete process.env.FEATURE_FLAG_FOO)

      it('returns true', () => {
        expect(hasFeature({id: 8}, 'FOO')).to.be.true
        expect(hasFeature(null, 'FOO')).to.be.true
      })
    })

    describe('with a feature flag not set', () => {
      it('returns false', () => {
        expect(hasFeature({id: 8}, 'FOO')).to.be.false
        expect(hasFeature(null, 'FOO')).to.be.false
      })
    })

    describe('with a feature flag in AB testing', () => {
      before(() => { process.env.FEATURE_FLAG_FOO = 'ab' })
      after(() => delete process.env.FEATURE_FLAG_FOO)

      it('works with a logged-out user', () => {
        expect(hasFeature(null, 'FOO')).to.be.false
      })

      it("returns true or false depending on the user's id", () => {
        expect(hasFeature({id: 11}, 'FOO')).to.be.true
        expect(hasFeature({id: 12}, 'FOO')).to.be.false
      })
    })
  })
})

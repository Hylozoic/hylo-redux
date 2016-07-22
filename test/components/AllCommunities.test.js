import { mocks } from '../support'
import { allPostsPrefetch } from '../../src/containers/AllCommunities.js'
import { NAVIGATE } from '../../src/actions/'

describe('allPostsPrefetch', () => {
  describe('with currentCommunityId', () => {
    it('redirects to the community', () => {
      var redirectUrl
      const slug = 'bazmunity'
      const communityId = '4'
      const currentUser = {
        id: 42,
        settings: {currentCommunityId: communityId},
        memberships: [{community_id: communityId, community: {slug, id: communityId}}]
      }
      const store = mocks.redux.store({
        people: {current: currentUser}
      })
      store.transformAction(NAVIGATE, action => redirectUrl = action.payload)
      allPostsPrefetch({dispatch: store.dispatch, query: {rd: 1}, currentUser})
      expect(redirectUrl).to.equal(`/c/${slug}`)
    })
  })
})

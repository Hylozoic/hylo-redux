import { mocks } from '../support'
import { prefetchForWrapped } from '../../src/containers/home.js'
import { NAVIGATE } from '../../src/actions/'

describe('prefetchForWrapped', () => {
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
      prefetchForWrapped('all-posts')({dispatch: store.dispatch, query: {rd: 1}, currentUser})
      expect(redirectUrl).to.equal(`/c/${slug}`)
    })
  })
})

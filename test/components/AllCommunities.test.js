import { allPostsPrefetch } from '../../src/containers/AllCommunities.js'
import { configureStore } from '../../src/store'

describe('allPostsPrefetch', () => {
  describe('with currentCommunityId', () => {
    var store, currentUser

    const slug = 'bazmunity'
    const communityId = '4'

    before(() => {
      currentUser = {
        id: 42,
        settings: {currentCommunityId: communityId},
        memberships: [{community_id: communityId, community: {slug, id: communityId}}]
      }

      const state = {people: {current: currentUser}}
      store = configureStore(state).store
    })

    it('redirects to the community', () => {
      allPostsPrefetch({dispatch: store.dispatch, query: {rd: 1}, currentUser})
      const { pathname } = store.getState().routing.locationBeforeTransitions
      expect(pathname).to.equal(`/c/${slug}`)
    })
  })
})

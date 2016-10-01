import { allPostsPrefetch } from '../../src/containers/AllCommunities.js'
import { configureStore } from '../../src/store'

describe('allPostsPrefetch', () => {
  describe('with currentCommunityId', () => {
    var store, currentUser

    const slug = 'bazmunity'
    const community = {slug: 'bazmunity', id: '4'}

    before(() => {
      currentUser = {
        id: 42,
        settings: {currentCommunityId: community.id},
        memberships: [{community_id: community.id, community}]
      }

      const state = {
        people: {current: currentUser},
        communities: {[community.slug]: community}
      }
      store = configureStore(state).store
    })

    it('redirects to the community', () => {
      allPostsPrefetch({store, dispatch: store.dispatch, query: {rd: 1}, currentUser})
      const { pathname } = store.getState().routing.locationBeforeTransitions
      expect(pathname).to.equal(`/c/${slug}`)
    })
  })
})

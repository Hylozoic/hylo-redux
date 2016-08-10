import { mocks, helpers } from '../support'
import CommunityJoinLinkHandler from '../../src/containers/community/CommunityJoinLinkHandler'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import { JOIN_COMMUNITY_WITH_CODE, NAVIGATE } from '../../src/actions'
import { getPrefetchedData } from 'react-fetcher'
const { createElement } = helpers

const mockJoinAction = (store, payload, error) => {
  store.transformAction(JOIN_COMMUNITY_WITH_CODE, action =>
    Promise.resolve({error, payload}))
}

const mockPrefetch = ({ dispatch }, params = {}) =>
  getPrefetchedData([CommunityJoinLinkHandler], {params, dispatch})

const community = {id: '1', name: 'Foomunity', slug: 'foomunity'}

describe('CommunityJoinLinkHandler', () => {
  var store, redirectUrl

  beforeEach(() => {
    store = mocks.redux.store()
    store.transformAction(NAVIGATE, ({ payload }) => redirectUrl = payload)
  })

  describe('with a valid code', () => {
    it('redirects to community with new membership', () => {
      mockJoinAction(store, {community})

      return mockPrefetch(store)
      .then(() => expect(redirectUrl).to.equal('/c/foomunity'))
    })

    it('redirects to community profile with existing membership', () => {
      mockJoinAction(store, {community, preexisting: true})
      return mockPrefetch(store)
      .then(() => expect(redirectUrl).to.equal('/c/foomunity'))
    })

    it('redirects to tag page with tag and existing membership', () => {
      mockJoinAction(store, {community, preexisting: true})
      return mockPrefetch(store, {tagName: 'bar'})
      .then(() => expect(redirectUrl).to.equal('/c/foomunity/tag/bar'))
    })
  })

  describe('with an invalid code', () => {
    it('shows an error message', () => {
      store = mocks.redux.store({
        people: {},
        errors: {
          [JOIN_COMMUNITY_WITH_CODE]: {payload: {response: {body: 'nope!'}}}
        }
      })

      const component = createElement(CommunityJoinLinkHandler, {}, {store})
      const node = renderToString(component)
      const doc = cheerio.load(node)
      expect(doc('.alert').text()).to.equal('nope!')
    })
  })
})

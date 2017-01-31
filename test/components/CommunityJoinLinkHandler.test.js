import { mocks } from '../support'
import CommunityJoinLinkHandler from '../../src/containers/community/CommunityJoinLinkHandler'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import { JOIN_COMMUNITY_WITH_CODE } from '../../src/actions/constants'
import { getPrefetchedData } from 'react-fetcher'
import { createElement } from '../support/helpers'
import { configureStore } from '../../src/store'
import { getUrlFromLocation } from '../../src/util/navigation'
import { HOST } from '../../src/util/api'
import nock from 'nock'

const mockJoinAction = payload =>
  nock(HOST).post('/noo/community/code').reply(200, payload)

const mockPrefetch = ({ dispatch }, params = {}) =>
  getPrefetchedData([CommunityJoinLinkHandler], {params, dispatch})

const community = {id: '1', name: 'Foomunity', slug: 'foomunity'}

const redirectUrl = store => {
  const location = store.getState().routing.locationBeforeTransitions
  return getUrlFromLocation(location)
}

describe('CommunityJoinLinkHandler', () => {
  var store

  beforeEach(() => {
    store = configureStore({people: {current: {memberships: []}}}).store
  })

  describe('with a valid code', () => {
    it('redirects to onboarding with new membership', () => {
      mockJoinAction({community})

      return mockPrefetch(store)
      .then(() => expect(redirectUrl(store)).to.equal('/add-skills?community=foomunity'))
    })

    it('redirects to community profile with existing membership', () => {
      mockJoinAction({community, preexisting: true})
      return mockPrefetch(store)
      .then(() => expect(redirectUrl(store)).to.equal('/c/foomunity'))
    })

    it('redirects to onboarding with tag and new membership', () => {
      mockJoinAction({community})
      return mockPrefetch(store, {tagName: 'bar'})
      .then(() => expect(redirectUrl(store)).to.equal('/add-skills?community=foomunity&tagName=bar'))
    })

    it('redirects to tag page with tag and existing membership', () => {
      mockJoinAction({community, preexisting: true})
      return mockPrefetch(store, {tagName: 'bar'})
      .then(() => expect(redirectUrl(store)).to.equal('/c/foomunity/tag/bar'))
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

require('../support')
import { mocks, helpers } from '../../support'
import Login from '../../../src/containers/Login.js'
import { renderIntoDocument } from 'react-addons-test-utils'
const { createElement } = helpers
import { HOST } from '../../../src/util/api'
import nock from 'nock'
import { configureStore } from '../../../src/store'
import { getUrlFromLocation } from '../../../src/util/navigation'

const redirectUrl = store => {
  const location = store.getState().routing.locationBeforeTransitions
  return getUrlFromLocation(location)
}

describe('Login', () => {
  describe('on successful login', () => {
    var store, node

    const setup = (loginResponse, props) => {
      nock(HOST).post('/login').reply(200, loginResponse)
      const component = createElement(Login, props, {store})
      node = renderIntoDocument(component).getWrappedInstance()
    }

    beforeEach(() => {
      store = configureStore({}).store
    })

    it("redirects to the person's profile by default", () => {
      setup({id: 42, memberships: {id: 1}}, {location: {query: {}}})
      return node.submit(mocks.event())
      .then(() => {
        expect(redirectUrl(store)).to.equal('/u/42')
        expect(window.analytics.alias).to.have.been.called()
      })
    })

    it('redirects to the community creation form if the user has no communities', () => {
      setup({id: 42}, {location: {query: {}}})
      return node.submit(mocks.event())
      .then(() => {
        expect(redirectUrl(store)).to.equal('/create')
        expect(window.analytics.alias).to.have.been.called()
      })
    })

    it('redirects to the last visited community if available', () => {
      const slug = 'foomunity'
      const communityId = '5'
      nock(HOST).get('/noo/community/foomunity').reply(200, {slug})
      const user = {
        id: 42,
        settings: {currentCommunityId: communityId},
        memberships: [{community_id: communityId, community: {id: communityId, slug}}]
      }
      setup(user, {location: {query: {}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl(store)).to.equal(`/c/${slug}`))
    })

    it('redirects to a specified location', () => {
      setup({id: 42}, {location: {query: {next: '/c/sandbox'}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl(store)).to.equal('/c/sandbox'))
    })
  })
})

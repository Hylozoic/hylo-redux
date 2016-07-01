require('../support')
import { mocks, helpers } from '../../support'
import Login from '../../../src/containers/Login.js'
import { LOGIN, NAVIGATE, FETCH_COMMUNITY } from '../../../src/actions'
import { renderIntoDocument } from 'react-addons-test-utils'
const { createElement } = helpers

describe('Login', () => {
  describe('on successful login', () => {
    var store, redirectUrl, node

    const setup = props => {
      const component = createElement(Login, props, {store})
      node = renderIntoDocument(component).getWrappedInstance()
    }

    beforeEach(() => {
      store = mocks.redux.store({
        people: {current: {id: 42}}
      })

      store.transformAction(LOGIN, () => Promise.resolve({payload: store.getState().people.current}))
      store.transformAction(NAVIGATE, action => redirectUrl = action.payload)
    })

    it("redirects to the person's profile by default", () => {
      setup({location: {query: {}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl).to.equal('/u/42'))
    })

    it('redirects to the last visited community if available', () => {
      const slug = 'foomunity'
      store.getState().people.current.settings = {currentCommunityId: 5}
      store.transformAction(FETCH_COMMUNITY, action => Promise.resolve({payload: {slug}}))
      setup({location: {query: {}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl).to.equal(`/c/${slug}`))
    })

    it('redirects to a specified location', () => {
      setup({location: {query: {next: '/c/sandbox'}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl).to.equal('/c/sandbox'))
    })
  })
})

require('../support')
import { mocks, helpers } from '../../support'
import Login from '../../../src/containers/Login.js'
import { LOGIN, NAVIGATE } from '../../../src/actions'
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

      store.transformAction(LOGIN, () => Promise.resolve({}))
      store.transformAction(NAVIGATE, action => redirectUrl = action.payload)
    })

    it("redirects to the person's profile by default", () => {
      setup({location: {query: {}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl).to.equal('/u/42'))
    })

    it('redirects to a specified location', () => {
      setup({location: {query: {next: '/c/sandbox'}}})
      return node.submit(mocks.event())
      .then(() => expect(redirectUrl).to.equal('/c/sandbox'))
    })
  })
})

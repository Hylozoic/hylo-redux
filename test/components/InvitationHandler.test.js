import { mocks, helpers } from '../support'
import InvitationHandler from '../../src/containers/community/InvitationHandler'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import { NAVIGATE, USE_INVITATION } from '../../src/actions'
import { getPrefetchedData } from 'react-fetcher'
const { createElement } = helpers

const mockPrefetch = ({ dispatch }, query) =>
  getPrefetchedData([InvitationHandler], {query, dispatch})

describe('InvitationHandler', () => {
  var store

  describe('when successful', () => {
    var redirectUrl

    beforeEach(() => {
      store = mocks.redux.store()
      store.transformAction(NAVIGATE, ({ payload }) => redirectUrl = payload)
    })

    it('redirects', () => {
      store.transformAction(USE_INVITATION, action => {
        expect(action.payload.path).to.equal('/noo/invitation/zap')
        return Promise.resolve({
          payload: {
            community: {id: 1, name: 'Foo', slug: 'foo'}
          }
        })
      })

      return mockPrefetch(store, {token: 'zap'})
      .then(() => expect(redirectUrl).to.equal('/add-skills?community=foo'))
    })
  })

  describe('when unsuccessful', () => {
    var props
    beforeEach(() => {
      store = mocks.redux.store({
        errors: {
          [USE_INVITATION]: {payload: {response: {body: 'used token'}}}
        }
      })
      props = {
        location: {query: {token: 'zap'}}
      }
    })

    it('shows an error message if invitation use fails', () => {
      const component = createElement(InvitationHandler, props, {store})
      const node = renderToString(component)
      const doc = cheerio.load(node)
      expect(doc('.alert').text()).to.equal('This invitation link has already been used.')
    })
  })
})

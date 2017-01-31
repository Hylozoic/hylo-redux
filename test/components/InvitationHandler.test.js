import { mocks } from '../support'
import InvitationHandler from '../../src/containers/community/InvitationHandler'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import { USE_INVITATION } from '../../src/actions/constants'
import { getPrefetchedData } from 'react-fetcher'
import { createElement } from '../support/helpers'
import { configureStore } from '../../src/store'
import { getUrlFromLocation } from '../../src/util/navigation'
import { HOST } from '../../src/util/api'
import nock from 'nock'

const redirectUrl = store => {
  const location = store.getState().routing.locationBeforeTransitions
  return getUrlFromLocation(location)
}

describe('InvitationHandler', () => {
  describe('when successful', () => {
    it('redirects', () => {
      const store = configureStore({people: {current: {memberships: []}}}).store

      nock(HOST).post('/noo/invitation/zap').reply(200, {
        community: {id: 1, name: 'Foo', slug: 'foo'}
      })

      return getPrefetchedData([InvitationHandler], {
        query: {token: 'zap'},
        dispatch: store.dispatch
      })
      .then(() => expect(redirectUrl(store)).to.equal('/add-skills?community=foo'))
    })
  })

  describe('when unsuccessful', () => {
    var props, store

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

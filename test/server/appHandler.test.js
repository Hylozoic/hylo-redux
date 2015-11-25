import support from '../support'
import appHandler from '../../src/server/appHandler'
import nock from 'nock'
import { HOST } from '../../src/util/api'

describe('appHandler', () => {
  let req, res

  beforeEach(() => {
    res = support.mocks.response()
  })

  describe('with an anonymous visitor', () => {
    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(200, {})
    })

    it('prefetches and renders the logged out home page', () => {
      req = support.mocks.request('/')

      return appHandler(req, res)
      .then(() => {
        expect(res.status).to.have.been.called.with(200)
        expect(res.send).to.have.been.called
        expect(res.body).to.contain('<!DOCTYPE html>')
        expect(res.body).to.contain('Home!')
        expect(res.body).to.contain('Log in')
      })
    })

    it('redirects away from a page that requires login', () => {
      req = support.mocks.request('/c/foo')

      return appHandler(req, res)
      .then(() => {
        expect(res.redirect).to.have.been.called.with(302, '/login?next=/c/foo')
      })
    })
  })

  describe('with a logged-in user', () => {
    let bannerUrl = 'http://nowhere.com/house.png'
    let community = {id: 1, name: 'House', slug: 'house', banner_url: bannerUrl}

    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(200, {id: 1, name: 'cat'})
      nock(HOST).get('/noo/community/house').reply(200, community)
    })

    it('loads a page that requires login', () => {
      req = support.mocks.request('/c/house')

      return appHandler(req, res)
      .then(() => {
        expect(res.status).to.have.been.called.with(200)
        expect(res.body).to.contain('House')
        expect(res.body).to.contain(bannerUrl)
      })
    })
  })
})

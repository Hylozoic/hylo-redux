import support from '../support'
import nock from 'nock'
import { inspect } from 'util'
import { get } from 'lodash'
import appHandler from '../../src/server/appHandler'
import { FETCH_CURRENT_USER } from '../../src/actions'
import { HOST } from '../../src/util/api'

const checkError = res => {
  if (res.error) {
    if (res.error.payload) {
      let output = inspect(res.error.payload, {depth: 3}).replace(/^/mg, '       ')
      throw new Error(`state has errors:\n${output}`)
    }
    throw res.error
  }
}

describe('appHandler', () => {
  let req, res

  beforeEach(() => {
    res = support.mocks.response()
  })

  describe('with a failed API request', () => {
    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(500, 'Oh noes')
    })

    it('sets the error property of the response', () => {
      req = support.mocks.request('/')

      return appHandler(req, res)
      .then(() => {
        let error = get(res.errors, FETCH_CURRENT_USER)
        expect(error).to.exist
        expect(error.payload.message).to.equal('Oh noes')
      })
    })
  })

  describe('with an anonymous visitor', () => {
    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(200, {})
    })

    it('prefetches and renders the logged out home page', () => {
      req = support.mocks.request('/')

      return appHandler(req, res)
      .then(() => {
        checkError(res)
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
        expect(res.redirect).to.have.been.called.with(302, '/login?next=%2Fc%2Ffoo')
      })
    })
  })

  describe('with a logged-in user', () => {
    let bannerUrl = 'http://nowhere.com/house.png'
    let community = {id: 1, name: 'House', slug: 'house', banner_url: bannerUrl}

    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(200, {id: 1, name: 'cat'})
      nock(HOST).get('/noo/community/house').reply(200, community)
      nock(HOST).get('/noo/community/house/posts?offset=0&limit=20').reply(200, {posts: [], posts_total: 0})
    })

    it('loads a page that requires login', () => {
      req = support.mocks.request('/c/house')

      return appHandler(req, res)
      .then(() => {
        checkError(res)
        expect(res.status).to.have.been.called.with(200)
        expect(res.body).to.contain('House')
        expect(res.body).to.contain(bannerUrl)
      })
    })
  })

  describe('on the user settings page', () => {
    beforeEach(() => {
      let user = {
        id: 1,
        name: 'cat',
        email: 'cat@house.com',
        settings: {}
      }
      nock(HOST).get('/noo/user/me').reply(200, user)
    })

    it('starts with the specified section expanded', () => {
      req = support.mocks.request('/settings?expand=password')
      return appHandler(req, res)
      .then(() => {
        checkError(res)
        expect(res.status).to.have.been.called.with(200)
        expect(res.body).to.contain('cat@house.com')
      })
    })
  })
})

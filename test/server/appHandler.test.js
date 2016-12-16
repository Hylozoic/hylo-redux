import { mocks } from '../support'
import nock from 'nock'
import { inspect } from 'util'
import { get } from 'lodash'
import appHandler from '../../src/server/appHandler'
import { FETCH_CURRENT_USER, fetchCurrentUser } from '../../src/actions'
import { fetchPost } from '../../src/actions/posts'
import { HOST } from '../../src/util/api'
import cheerio from 'cheerio'
import { mockActionResponse } from '../support/helpers'

const checkError = res => {
  if (res.statusCode === 500) {
    console.error(res.body)
  }
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
    res = mocks.response()
  })

  describe('with a failed API request', () => {
    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(500, 'Oh noes')
    })

    it('sets the error property of the response', () => {
      req = mocks.request('/login')

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

    it('prefetches and renders the login page', () => {
      req = mocks.request('/login')

      return appHandler(req, res)
      .then(() => {
        checkError(res)
        expect(res.body).to.contain('<!DOCTYPE html>')
        expect(res.body).to.contain('Log in')
        expect(res.body).to.match(/<a .*href="\/signup" .*>Sign up<\/a>/)
        expect(res.status).to.have.been.called.with(200)
        expect(res.send).to.have.been.called
      })
    })

    it('redirects away from a page that requires login', () => {
      req = mocks.request('/c/foo/people')

      return appHandler(req, res)
      .then(() => {
        expect(res.redirect).to.have.been.called.with(302, '/login?next=%2Fc%2Ffoo%2Fpeople')
      })
    })

    it('preserves clickthrough parameters', () => {
      req = mocks.request('/c/foo/people?ctt=digest_email&cti=42')

      return appHandler(req, res)
      .then(() => {
        const path = '/login?next=%2Fc%2Ffoo%2Fpeople&ctt=digest_email&cti=42'
        expect(res.redirect).to.have.been.called.with(302, path)
      })
    })
  })

  describe('with a logged-in user', () => {
    let bannerUrl = 'http://nowhere.com/house.png'
    let community = {id: 1, name: 'House', slug: 'house', banner_url: bannerUrl, settings: {}}

    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(200, {id: 1, name: 'cat', settings: {}})
      nock(HOST).get('/noo/community/house').reply(200, community)
      nock(HOST).get('/noo/community/house/posts?offset=0&limit=20').reply(200, {
        posts: [], posts_total: 0
      })
      nock(HOST).get('/noo/community/house/tags/followed').reply(200, [])
      nock(HOST).get('/noo/community/house/members?limit=10&offset=0').reply(200, {
        items: [], total: 0
      })
    })

    it('loads a page that requires login', () => {
      req = mocks.request('/c/house/people')

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
      req = mocks.request('/settings?expand=password')
      return appHandler(req, res)
      .then(() => {
        checkError(res)
        expect(res.status).to.have.been.called.with(200)
        expect(res.body).to.contain('cat@house.com')
      })
    })
  })

  describe('on single post page', () => {
    beforeEach(() => {
      let post = {
        id: 1,
        name: 'A test post',
        description: 'The description body',
        media: [{
          type: 'image',
          url: 'http://foo.com/bar.jpg',
          width: 99,
          height: 101
        }],
        communities: [
          {name: 'Foomunity'}
        ],
        comments: [],
        voters: [],
        followers: [],
        user: {name: ''},
        created_at: new Date()
      }
      mockActionResponse(fetchPost(1), post)
      mockActionResponse(fetchCurrentUser(), {})
    })

    it('displays the post', () => {
      req = mocks.request('/p/1')
      return appHandler(req, res)
      .then(() => {
        checkError(res)
        expect(res.status).to.have.been.called.with(200)
        expect(res.body).to.contain('A test post')
      })
    })

    it('sets the metatags', () => {
      req = mocks.request('/p/1')
      return appHandler(req, res)
      .then(() => {
        checkError(res)
        expect(res.status).to.have.been.called.with(200)

        var $ = cheerio.load(res.body)
        expect($('meta[property="og:title"]').attr('content')).to.equal('A test post')
        expect($('meta[property="og:description"]').attr('content')).to.equal('The description body')
        expect($('meta[property="og:image"]').attr('content')).to.equal('http://foo.com/bar.jpg')
        expect($('meta[property="og:image:width"]').attr('content')).to.equal('99')
        expect($('meta[property="og:image:height"]').attr('content')).to.equal('101')
      })
    })
  })

  describe('on a page that redirects during prefetch', () => {
    beforeEach(() => {
      nock(HOST).get('/noo/user/me').reply(200, {id: 1, name: 'cat'})
      nock(HOST).get('/noo/tag/foo').reply(200, {name: 'foo', post: {id: 'f'}})
    })

    it('responds with 302', () => {
      req = mocks.request('/tag/foo')

      return appHandler(req, res)
      .then(() => {
        expect(res.redirect).to.have.been.called.with(302, '/p/f')
      })
    })
  })
})

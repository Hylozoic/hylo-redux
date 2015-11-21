import test from '../index'
import appHandler from '../../src/server/appHandler'
import nock from 'nock'
import { HOST } from '../../src/util/api'

describe('appHandler', () => {
  let req, res

  before(() => {
    req = test.mocks.request('/')
    res = test.mocks.response()
    nock(HOST).get('/noo/user/me').reply(200, {})
  })

  it('prefetches and renders the logged out home page', () => {
    return appHandler(req, res)
    .then(() => {
      expect(res.status).to.have.been.called.with(200)
      expect(res.send).to.have.been.called
      expect(res.body).to.contain('<!DOCTYPE html>')
      expect(res.body).to.contain('Home!')
      expect(res.body).to.contain('Log in')
    })
  })
})

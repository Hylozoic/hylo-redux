import dotenv from 'dotenv'
import chai from 'chai'
import nock from 'nock'
process.env.NODE_ENV = 'test'

dotenv.load({path: './.env.test', silent: true})

chai.use(require('chai-spies'))
global.expect = chai.expect
global.spy = chai.spy

afterEach(() => {
  nock.cleanAll()
})

export mocks from './support/mocks'

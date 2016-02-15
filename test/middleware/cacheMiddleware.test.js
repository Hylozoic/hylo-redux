require('../support')
import { cacheMiddleware } from '../../src/middleware'

describe('cacheMiddleware', () => {
  let next, state
  let mockStore = {getState: () => state}
  let middleware = cacheMiddleware(mockStore)

  beforeEach(() => {
    state = {}
    next = spy(() => {})
  })

  it('continues the chain if the cache bucket does not exist', () => {
    let action = {meta: {cache: {bucket: 'foo', id: 'bar'}}}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  it('calls next if a cache hit is not found', () => {
    let action = {meta: {cache: {bucket: 'foo', id: 'bar'}}}
    state.foo = {baz: 'baz'}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  it('stops the chain if a cache hit is found', () => {
    let action = {meta: {cache: {bucket: 'foo', id: 'bar'}}}
    state.foo = {bar: 'bar'}
    expect(middleware(next)(action)).to.deep.equal(Promise.resolve(action))
    expect(next).not.to.have.been.called()
  })

  it('continues the chain if refresh is set', () => {
    let action = {meta: {cache: {bucket: 'foo', id: 'bar', refresh: true}}}
    state.foo = {bar: 'bar'}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  describe('with a cache comparator instead of an id', () => {
    it('stops the chain if a cache hit is found', () => {
      let match = item => item.bar === 'bar'
      state.foo = {
        a: {bar: 'baz'},
        b: {bar: 'bax'},
        c: {bar: 'bar'}
      }
      let action = {meta: {cache: {bucket: 'foo', match}}}
      expect(middleware(next)(action)).to.deep.equal(Promise.resolve(action))
      expect(next).not.to.have.been.called()
    })

    it('calls next if a cache hit is not found', () => {
      let match = item => item.bar === 'bar'
      state.foo = {
        a: {bar: 'baz'},
        b: {bar: 'bax'},
        c: {bar: 'bad'}
      }
      let action = {meta: {cache: {bucket: 'foo', match}}}
      middleware(next)(action)
      expect(next).to.have.been.called()
    })
  })

  describe('with array=true', () => {
    it('counts a cache hit if the data is past the offset', () => {
      let action = {meta: {cache: {bucket: 'foo', id: 'bar', array: true, offset: 5}}}
      state.foo = {bar: [1, 2, 3, 4, 5, 6]}
      expect(middleware(next)(action)).to.deep.equal(Promise.resolve(action))
      expect(next).not.to.have.been.called()
    })

    it('counts a cache miss if the data is not past the offset', () => {
      let action = {meta: {cache: {bucket: 'foo', id: 'bar', array: true, offset: 5}}}
      state.foo = {bar: [1, 2, 3, 4, 5]}
      middleware(next)(action)
      expect(next).to.have.been.called()
    })
  })
})

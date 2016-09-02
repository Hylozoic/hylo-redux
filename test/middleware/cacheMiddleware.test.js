import support from '../support'
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
    let action = {type: 'FOO', meta: {cache: {bucket: 'foo', id: 'bar'}}}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  it('calls next if a cache hit is not found', () => {
    let action = {type: 'FOO', meta: {cache: {bucket: 'foo', id: 'bar'}}}
    state.foo = {baz: 'baz'}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  it('stops the chain if a cache hit is found', () => {
    let action = {type: 'FOO', meta: {cache: {bucket: 'foo', id: 'bar'}}}
    state.foo = {bar: 'bar'}
    return middleware(next)(action)
    .then(val => {
      expect(val).to.deep.equal({...action, payload: 'bar', cacheHit: true})
      expect(next).not.to.have.been.called()
    })
  })

  it('continues the chain if refresh is set', () => {
    let action = {
      type: 'FOO',
      meta: {cache: {bucket: 'foo', id: 'bar', refresh: true}}
    }
    state.foo = {bar: 'bar'}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  it('continues the chain for a pending action', () => {
    let action = {type: 'FOO_PENDING'}
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
      let action = {type: 'FOO', meta: {cache: {bucket: 'foo', match}}}
      return middleware(next)(action)
      .then(val => {
        expect(val).to.deep.equal({...action, payload: state.foo.c, cacheHit: true})
        expect(next).not.to.have.been.called()
      })
    })

    it('calls next if a cache hit is not found', () => {
      let match = item => item.bar === 'bar'
      state.foo = {
        a: {bar: 'baz'},
        b: {bar: 'bax'},
        c: {bar: 'bad'}
      }
      let action = {type: 'FOO', meta: {cache: {bucket: 'foo', match}}}
      middleware(next)(action)
      expect(next).to.have.been.called()
    })
  })

  describe('with array=true', () => {
    it('counts a cache hit if the data is past the offset', () => {
      let action = {
        type: 'FOO',
        meta: {cache: {bucket: 'foo', id: 'bar', array: true, offset: 5}}
      }
      state.foo = {bar: [1, 2, 3, 4, 5, 6]}
      return middleware(next)(action)
      .then(val => {
        expect(val).to.deep.equal({...action, payload: state.foo.bar, cacheHit: true})
        expect(next).not.to.have.been.called()
      })
    })

    it('counts a cache miss if the data is not past the offset', () => {
      let action = {
        type: 'FOO',
        meta: {cache: {bucket: 'foo', id: 'bar', array: true, offset: 5}}
      }
      state.foo = {bar: [1, 2, 3, 4, 5]}
      middleware(next)(action)
      expect(next).to.have.been.called()
    })
  })
})

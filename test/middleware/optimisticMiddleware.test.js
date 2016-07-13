import support from '../support'
import { mocks } from '../support'
import { optimisticMiddleware } from '../../src/middleware'

describe('optimisticMiddleware', () => {
  let next, state, store, middleware

  beforeEach(() => {
    state = {}
    store = mocks.redux.store()
    middleware = optimisticMiddleware(mockStore)
    next = spy(() => {})
  })

  it('continues the chain for a non optimistic action', () => {
    let action = {type: 'FOO', payload: {id: 3}}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  it('continues the chain for a non optimistic action', () => {
    let action = {type: 'FOO', payload: {id: 3}}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })
})

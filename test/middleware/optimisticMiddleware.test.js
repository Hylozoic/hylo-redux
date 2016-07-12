import support from '../support'
import { optimisticMiddleware } from '../../src/middleware'

describe('cacheMiddleware', () => {
  let next, state
  let mockStore = {getState: () => state}
  let middleware = optimisticMiddleware()(mockStore)

  beforeEach(() => {
    state = {}
    next = spy(() => {})
  })

  it('continues the chain for a non optimistic action', () => {
    let action = {type: 'FOO', meta: {cache: {bucket: 'foo', id: 'bar'}}}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })
})

require('../support')
import { mocks } from '../support'
import { optimisticMiddleware } from '../../src/middleware'
import { SET_STATE } from '../../src/actions'

describe('optimisticMiddleware', () => {
  let next, state, store, middleware

  beforeEach(() => {
    state = {
      aReducer: {a: 1, b: 2}
    }
    store = mocks.redux.store(state)
    middleware = optimisticMiddleware(store)
    next = spy(val => Promise.resolve(val))
  })

  it('continues the chain for a non optimistic action', () => {
    let action = {type: 'FOO', payload: {id: 3}}
    middleware(next)(action)
    expect(next).to.have.been.called()
  })

  describe('with a promise payload and meta.optimistic', () => {
    it('appends a dispatch to SET_STATE on error', () => {
      let action = {
        type: 'FOO',
        payload: new Promise((resolve, reject) => reject('promise failed')),
        meta: {optimistic: true}
      }
      let setStatePayload
      store.transformAction(SET_STATE, action => {
        setStatePayload = action.payload
      })
      return middleware(next)(action)
      .then(() => {
        expect(next).to.have.been.called()
        expect(setStatePayload).to.deep.equal(store.getState())
      })
    })
  })
})

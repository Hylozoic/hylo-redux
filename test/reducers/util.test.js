require('../support')
import { combineReducers, createStore } from 'redux'
import { toggleIncludes, handleSetState, composeReducers } from '../../src/reducers/util'
import { SET_STATE } from '../../src/actions'

describe('toggleIncludes', () => {
  it('adds an element', () => {
    expect(toggleIncludes(['f', {x: 'h'}], {x: 'g'})).to.deep.equal(['f', {x: 'h'}, {x: 'g'}])
  })

  it('removes an element', () => {
    expect(toggleIncludes(['f', {x: 'g'}], {x: 'g'})).to.deep.equal(['f'])
  })
})

describe('handleSetState', () => {
  const objectReducer = (state = {a: 1, b: 2}, action) => {
    if (action.type === 'ADD_C') {
      return {...state, c: action.payload}
    }
    return state
  }
  const stringReducer = (state = 'default', action) => {
    return state
  }

  it('injects a SET_STATE clause in each reducer', () => {
    const store = createStore(composeReducers(combineReducers({objectReducer, stringReducer}), handleSetState), {})
    const newState = {
      objectReducer: {c: 3, d: 4},
      stringReducer: 'updated'
    }
    store.dispatch({type: SET_STATE, payload: newState})
    expect(store.getState()).to.deep.equal(newState)
  })

  it('preserves existing actions', () => {
    const store = createStore(composeReducers(combineReducers({objectReducer, stringReducer}), handleSetState), {})
    store.dispatch({type: 'ADD_C', payload: 333})
    const expected = {
      objectReducer: {a: 1, b: 2, c: 333},
      stringReducer: 'default'
    }
    expect(store.getState()).to.deep.equal(expected)
  })
})

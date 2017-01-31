require('../support')
import { combineReducers, createStore } from 'redux'
import {
  toggleIncludes, handleSetState, composeReducers, mergeList
} from '../../src/reducers/util'
import { SET_STATE } from '../../src/actions/constants'

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

  it('replaces the state with payload on SET_STATE', () => {
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

describe('mergeList', () => {
  it('works with null initial state', () => {
    const newItems = [
      {id: 1, name: 'foo'},
      {id: 2, name: 'bar'}
    ]
    expect(mergeList(null, newItems, 'id')).to.deep.equal({
      1: {id: 1, name: 'foo'},
      2: {id: 2, name: 'bar'}
    })
  })

  it('preserves existing properties', () => {
    const initialItems = {
      1: {id: 1, name: 'foo'},
      2: {id: 2, name: 'bar', settings: {ok: 'maybe'}},
      3: {id: 3, name: 'baz'}
    }

    const newItems = [
      {id: 1, name: 'foo', settings: {ok: 'yes'}},
      {id: 2, name: 'bar'}
    ]

    expect(mergeList(initialItems, newItems, 'id')).to.deep.equal({
      1: {id: 1, name: 'foo', settings: {ok: 'yes'}},
      2: {id: 2, name: 'bar', settings: {ok: 'maybe'}},
      3: {id: 3, name: 'baz'}
    })
  })

  it('overrides array values', () => {
    const initialItems = {
      1: {id: 1, name: 'foo', panels: ['top', 'bottom']}
    }

    const newItems = [
      {id: 1, name: 'foo', panels: ['left', 'right']}
    ]

    expect(mergeList(initialItems, newItems, 'id')).to.deep.equal({
      1: {id: 1, name: 'foo', panels: ['left', 'right']}
    })
  })
})

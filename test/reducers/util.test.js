require('../support')
import { combineReducers, createStore } from 'redux'
import { toggleIncludes, injectSetState } from '../../src/reducers/util'
import { SET_STATE } from '../../src/actions'

describe('toggleIncludes', () => {
  it('adds an element', () => {
    expect(toggleIncludes(['f', {x: 'h'}], {x: 'g'})).to.deep.equal(['f', {x: 'h'}, {x: 'g'}])
  })

  it('removes an element', () => {
    expect(toggleIncludes(['f', {x: 'g'}], {x: 'g'})).to.deep.equal(['f'])
  })
})

require('../support')
import tooltips from '../../src/reducers/tooltips'
import {
  REGISTER_TOOLTIP,
  UNREGISTER_TOOLTIP
} from '../../src/actions/constants'

const state = {
  first: 1,
  third: 3
}

describe('tooltips', () => {
  describe('on REGISTER_TOOLTIP', () => {
    it('adds the new tooltip id and index', () => {
      const action = {
        type: REGISTER_TOOLTIP,
        payload: {
          id: 'second',
          index: 2
        }
      }
      expect(tooltips(state, action)).to.deep.equal({
        first: 1,
        third: 3,
        second: 2
      })
    })
  })

  describe('on UNREGISTER_TOOLTIP', () => {
    it('removes the tooltip entry and index', () => {
      const action = {
        type: UNREGISTER_TOOLTIP,
        payload: {
          id: 'third'
        }
      }
      expect(tooltips(state, action)).to.deep.equal({
        first: 1
      })
    })
  })
})

import { UPDATE_CURRENT_USER_PENDING } from '../../src/constants'
import currentUser from '../../src/reducers/currentUser'

describe('currentUser', () => {
  it('merges updates', () => {
    const action = {
      type: UPDATE_CURRENT_USER_PENDING,
      meta: {
        params: {
          settings: {viewedTooltips: {topics: true}}
        }
      }
    }

    const state = {
      settings: {
        viewedTooltips: {
          selector: true
        },
        tags: ['foo', 'bar'],
        leftNavIsOpen: true
      }
    }

    expect(currentUser(state, action)).to.deep.equal({
      settings: {
        viewedTooltips: {
          selector: true,
          topics: true
        },
        tags: ['foo', 'bar'],
        leftNavIsOpen: true
      }
    })
  })
})

require('../support')
import peopleByQuery from '../../src/reducers/peopleByQuery'
import { FETCH_PEOPLE } from '../../src/actions'

describe('peopleByQuery', () => {
  it('stores the community moderators when fetching people for a community', () => {
    let state = {}

    let action = {
      type: FETCH_PEOPLE,
      payload: {
        total: '1',
        items: [{id: 'a', isModerator: 1}]
      },
      meta: {
        cache: {id: 'subject=community&id=123'}
      }
    }

    let expectedState = {
      'subject=community&id=123': ['a'],
      'subject=community-moderators&id=123': ['a']
    }

    expect(peopleByQuery(state, action)).to.deep.equal(expectedState)
  })
})

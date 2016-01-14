require('../support')
import peopleByQuery from '../../src/reducers/peopleByQuery'
import { FETCH_PEOPLE } from '../../src/actions'

describe('peopleByQuery', () => {
  it('stores project moderators when fetching contributors', () => {
    let state = {
      'subject=project&id=5': ['e'],
      'subject=project-moderators&id=5': ['e']
    }

    let action = {
      type: FETCH_PEOPLE,
      payload: {
        people: [
          {id: 'a'},
          {id: 'b', membership: {role: 0}},
          {id: 'c', membership: {role: 1}},
          {id: 'd', membership: {role: 1}}
        ]
      },
      meta: {
        cache: {id: 'subject=project&id=5'}
      }
    }

    let expectedState = {
      'subject=project&id=5': ['e', 'a', 'b', 'c', 'd'],
      'subject=project-moderators&id=5': ['e', 'c', 'd']
    }

    expect(peopleByQuery(state, action)).to.deep.equal(expectedState)
  })
})

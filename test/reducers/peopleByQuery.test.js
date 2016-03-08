require('../support')
import peopleByQuery from '../../src/reducers/peopleByQuery'
import { FETCH_PEOPLE, FETCH_PROJECT, REMOVE_PROJECT_CONTRIBUTOR } from '../../src/actions'

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

  it("stores the user's moderator status when fetching a single project", () => {
    let state = {
      'subject=project-moderators&id=5': ['a']
    }

    let action = {
      type: FETCH_PROJECT,
      payload: {
        id: '5',
        membership: {user_id: 'b', role: 1}
      }
    }

    let expectedState = {
      'subject=project-moderators&id=5': ['a', 'b']
    }

    expect(peopleByQuery(state, action)).to.deep.equal(expectedState)
  })

  it('removes a person from both contributor and moderator lists', () => {
    let state = {
      'subject=project&id=5': ['a', 'b', 'c'],
      'subject=project-moderators&id=5': ['a', 'b']
    }

    let action = {
      type: REMOVE_PROJECT_CONTRIBUTOR,
      meta: {projectId: '5', userId: 'b'}
    }

    let expectedState = {
      'subject=project&id=5': ['a', 'c'],
      'subject=project-moderators&id=5': ['a']
    }

    expect(peopleByQuery(state, action)).to.deep.equal(expectedState)
  })

  it('stores the community moderators when fetching people for a community', () => {
    let state = {}

    let action = {
      type: FETCH_PEOPLE,
      payload: {
        people_total: '1',
        people: [{id: 'a', isModerator: 1}]
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

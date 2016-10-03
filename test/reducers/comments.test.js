import { helpers } from '../support'
import comments from '../../src/reducers/comments'
import {
  FETCH_COMMENTS,
  CREATE_COMMENT,
  THANK_PENDING
} from '../../src/actions'
import { fetchActivity } from '../../src/actions/activity'
import { configureStore } from '../../src/store'

describe('comments', () => {
  describe('on FETCH_COMMENTS', () => {
    it('appends comments to state', () => {
      let action = {
        type: FETCH_COMMENTS,
        payload: {
          comments: [
            {id: '2', text: 'bar'},
            {id: '3', text: 'baz'}
          ]
        }
      }

      let state = {
        '1': {id: '1', text: 'foo'}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo'},
        '2': {id: '2', text: 'bar'},
        '3': {id: '3', text: 'baz'}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on CREATE_COMMENT', () => {
    it('appends comment to state', () => {
      let action = {
        type: CREATE_COMMENT,
        payload: {id: '2', text: 'bar'}
      }

      let state = {
        '1': {id: '1', text: 'foo'}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo'},
        '2': {id: '2', text: 'bar'}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on FETCH_ACTIVITY', () => {
    let store
    const action = fetchActivity(0, true)

    beforeEach(() => {
      store = configureStore({
        comments: {
          '1': {id: '1', text: 'foo'},
          '2': {id: '2', user_id: '7'}
        }
      }).store
      helpers.mockActionResponse(action, {
        items: [
          {id: '20', comment: {id: '2', text: 'bar'}},
          {id: '30', comment: {id: '3', text: 'baz'}},
          {id: '40'}
        ]
      })
    })

    it('extracts comments and appends to state', () => {
      store.dispatch(action)
      .then(() => {
        const { comments, activities } = store.getState()

        expect(comments).to.deep.equal({
          '1': {id: '1', text: 'foo'},
          '2': {id: '2', user_id: '7', text: 'bar'},
          '3': {id: '3', text: 'baz', user: {id: 'a', name: 'Alf'}}
        })

        expect(activities).to.deep.equal({
          '20': {id: '20', comment_id: '2'},
          '30': {id: '30', comment_id: '3'},
          '40': {id: '40'}
        })
      })
    })
  })

  describe('on THANK_PENDING', () => {
    it('adds a thanks', () => {
      let person = {id: '10', name: 'foo', avatar_url: 'http://foo.com/foo.png'}

      let action = {
        type: THANK_PENDING,
        meta: {id: '1', personId: person.id}
      }

      let state = {
        '1': {id: '1', text: 'foo', thank_ids: []},
        '2': {id: '2', text: 'bar', thank_ids: []}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo', thank_ids: [person.id]},
        '2': {id: '2', text: 'bar', thank_ids: []}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })

    it('removes a thanks', () => {
      let action = {
        type: THANK_PENDING,
        meta: {id: '1', personId: '10'}
      }

      let state = {
        '1': {id: '1', text: 'foo', thank_ids: ['10', '20']},
        '2': {id: '2', text: 'bar', thank_ids: []}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo', thank_ids: ['20']},
        '2': {id: '2', text: 'bar', thank_ids: []}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })
})

require('../support')
import comments from '../../src/reducers/comments'
import {
  FETCH_ACTIVITY,
  FETCH_COMMENTS,
  CREATE_COMMENT,
  THANK_PENDING
} from '../../src/actions'

describe('comments', () => {
  describe('on FETCH_COMMENTS', () => {
    it('appends comments to state', () => {
      let action = {
        type: FETCH_COMMENTS,
        payload: [
          {id: '2', text: 'bar'},
          {id: '3', text: 'baz'}
        ]
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
    it('extracts comments and appends to state', () => {
      let action = {
        type: FETCH_ACTIVITY,
        payload: {items: [
          {id: '20', comment: {id: '2', text: 'bar'}},
          {id: '30', comment: {id: '3', text: 'baz'}},
          {id: '40'}
        ]}
      }

      let state = {
        '1': {id: '1', text: 'foo'},
        '3': {id: '3', text: 'baz', user: {id: 'a', name: 'Alf'}}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo'},
        '2': {id: '2', text: 'bar'},
        '3': {id: '3', text: 'baz', user: {id: 'a', name: 'Alf'}}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on THANK_PENDING', () => {
    it('adds a thanks', () => {
      let person = {id: '10', name: 'foo', avatar_url: 'http://foo.com/foo.png'}

      let action = {
        type: THANK_PENDING,
        meta: {commentId: '1', person}
      }

      let state = {
        '1': {id: '1', text: 'foo', thanks: []},
        '2': {id: '2', text: 'bar', thanks: []}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo', isThanked: true, thanks: [person]},
        '2': {id: '2', text: 'bar', thanks: []}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on THANK_PENDING', () => {
    it('removes a thanks', () => {
      let action = {
        type: THANK_PENDING,
        meta: {commentId: '1', person: {id: '10'}}
      }

      let state = {
        '1': {id: '1', text: 'foo', isThanked: true, thanks: [{id: '10'}, {id: '20'}]},
        '2': {id: '2', text: 'bar', thanks: []}
      }

      let expectedState = {
        '1': {id: '1', text: 'foo', isThanked: false, thanks: [{id: '20'}]},
        '2': {id: '2', text: 'bar', thanks: []}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })
})

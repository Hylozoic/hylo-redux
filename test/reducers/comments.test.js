require('../support')
import comments from '../../src/reducers/comments'
import {
  FETCH_COMMENTS,
  CREATE_COMMENT
} from '../../src/actions'

describe('comments', () => {
  describe('on FETCH_COMMENTS', () => {
    it('appends ids to state', () => {
      let action = {
        type: FETCH_COMMENTS,
        payload: [
          {id: '2', comment_text: 'bar'},
          {id: '3', comment_text: 'baz'}
        ]
      }

      let state = {
        '1': {id: '1', comment_text: 'foo'}
      }

      let expectedState = {
        '1': {id: '1', comment_text: 'foo'},
        '2': {id: '2', comment_text: 'bar'},
        '3': {id: '3', comment_text: 'baz'}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on CREATE_COMMENT', () => {
    it('appends ids to state', () => {
      let action = {
        type: CREATE_COMMENT,
        payload: {id: '2', comment_text: 'bar'}
      }

      let state = {
        '1': {id: '1', comment_text: 'foo'}
      }

      let expectedState = {
        '1': {id: '1', comment_text: 'foo'},
        '2': {id: '2', comment_text: 'bar'}
      }

      expect(comments(state, action)).to.deep.equal(expectedState)
    })
  })
})

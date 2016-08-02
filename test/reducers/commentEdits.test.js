require('../support')
import commentEdits from '../../src/reducers/commentEdits'
import {
  UPDATE_COMMENT_EDITOR,
  CREATE_COMMENT,
  UPDATE_COMMENT
} from '../../src/actions'

describe('commentEdits', () => {
  describe('on UPDATE_COMMENT_EDITOR', () => {
    describe('with new comment', () => {
      it('adds the new comment text', () => {
        const action = {
          type: UPDATE_COMMENT_EDITOR,
          payload: {
            id: '2',
            text: 'The new text being added',
            bucket: 'new'
          }
        }
        const state = {
          new: {
            '1': 'An unfinished comment to another post'
          }
        }
        const expected = {
          new: {
            '1': 'An unfinished comment to another post',
            '2': 'The new text being added'
          }
        }
        expect(commentEdits(state, action)).to.deep.equal(expected)
      })
    })

    describe('with existing comment', () => {
      it('updates the comment text', () => {
        const action = {
          type: UPDATE_COMMENT_EDITOR,
          payload: {
            id: '1',
            text: 'The updated comment text',
            bucket: 'new'
          }
        }
        const state = {
          new: {
            '1': 'The current comment text',
            '3': 'An unfinished comment to another post'
          }
        }
        const expected = {
          new: {
            '1': 'The updated comment text',
            '3': 'An unfinished comment to another post'
          }
        }
        expect(commentEdits(state, action)).to.deep.equal(expected)
      })
    })
  })

  describe('on CREATE_COMMENT', () => {
    it('clears the comment text', () => {
      const action = {
        type: CREATE_COMMENT,
        meta: {
          id: '2'
        }
      }
      const state = {
        new: {
          '2': 'The current comment text',
          '3': 'An unfinished comment to another post'
        }
      }
      const expected = {
        new: {
          '2': undefined,
          '3': 'An unfinished comment to another post'
        }
      }
      expect(commentEdits(state, action)).to.deep.equal(expected)
    })
  })

  describe('on UPDATE_COMMENT', () => {
    it('clears the comment text', () => {
      const action = {
        type: UPDATE_COMMENT,
        meta: {
          id: '2'
        }
      }
      const state = {
        edit: {
          '2': 'The current comment text',
          '3': 'An unfinished comment to another post'
        }
      }
      const expected = {
        edit: {
          '2': undefined,
          '3': 'An unfinished comment to another post'
        }
      }
      expect(commentEdits(state, action)).to.deep.equal(expected)
    })
  })
})

require('../support')
import commentsByPost from '../../src/reducers/commentsByPost'
import {
  FETCH_COMMENTS,
  CREATE_COMMENT
} from '../../src/actions'

describe('commentsByPost', () => {
  describe('on FETCH_COMMENTS', () => {
    it('appends ids to state', () => {
      let action = {
        type: FETCH_COMMENTS,
        payload: {
          comments: [
            {id: '10', text: 'foo'},
            {id: '11', text: 'bar'}
          ]
        },
        meta: {id: '1', subject: 'post'}
      }

      let state = {
        '1': ['12'],
        '2': ['13']
      }

      let expectedState = {
        '1': ['12', '10', '11'],
        '2': ['13']
      }

      expect(commentsByPost(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on CREATE_COMMENT', () => {
    it('appends ids to state', () => {
      let action = {
        type: CREATE_COMMENT,
        payload: {id: 10, text: 'foo'},
        meta: {id: 1}
      }

      let state = {
        1: [12],
        2: [13]
      }

      let expectedState = {
        1: [12, 10],
        2: [13]
      }

      expect(commentsByPost(state, action)).to.deep.equal(expectedState)
    })
  })
})

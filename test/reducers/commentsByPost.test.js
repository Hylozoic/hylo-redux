require('../support')
import commentsByPost from '../../src/reducers/commentsByPost'
import {
  FETCH_COMMENTS,
  FETCH_POSTS,
  CREATE_COMMENT_PENDING,
  CREATE_COMMENT
} from '../../src/actions/constants'

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

  describe('on CREATE_COMMENT_PENDING', () => {
    it('appends the temporary comment to state', () => {
      let action = {
        type: CREATE_COMMENT_PENDING,
        meta: {id: 1, comment: {id: 'post1_123', text: 'foo'}}
      }

      let state = {
        1: [12],
        2: [13]
      }

      let expectedState = {
        1: [12, 'post1_123'],
        2: [13]
      }

      expect(commentsByPost(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on CREATE_COMMENT', () => {
    it('appends the saved id to state and removes the temporary one', () => {
      let action = {
        type: CREATE_COMMENT,
        payload: {id: 14, text: 'foo'},
        meta: {id: 2, comment: {id: 'post2_123'}}
      }

      let state = {
        1: [12],
        2: [13, 'post2_123']
      }

      let expectedState = {
        1: [12],
        2: [13, 14]
      }

      expect(commentsByPost(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on FETCH_POSTS', () => {
    it('appends comment ids to existing ones', () => {
      const action = {
        type: FETCH_POSTS,
        payload: {
          posts: [
            {
              id: 1,
              comments: [
                {id: 4, text: 'wow'},
                {id: 5, text: 'ok'},
                {id: 6, text: 'yum'}
              ]
            },
            {
              id: 2,
              comments: [
                {id: 4, text: 'bah'}
              ]
            }
          ]
        }
      }

      const state = {
        1: [1, 2, 3, 4]
      }

      const expectedState = {
        1: [1, 2, 3, 4, 5, 6],
        2: [4]
      }

      expect(commentsByPost(state, action)).to.deep.equal(expectedState)
    })
  })
})

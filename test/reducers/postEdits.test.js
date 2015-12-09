require('../support')
import postEdits from '../../src/reducers/postEdits'
import { START_POST_EDIT, UPLOAD_IMAGE } from '../../src/actions'

describe('postEdits', () => {
  describe('on START_POST_EDIT', () => {
    it('sets up post attributes and media', () => {
      let action = {
        type: START_POST_EDIT,
        payload: {
          id: 'a',
          name: 'foo',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ]
        }
      }

      let state = {}

      let expectedState = {
        a: {
          id: 'a',
          name: 'foo',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ],
          expanded: true
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on UPLOAD_IMAGE', () => {
    it('ignores actions with the wrong subject', () => {
      let action = {
        type: UPLOAD_IMAGE,
        payload: 'http://foo.com/foo.gif',
        meta: {id: 'a'}
      }

      expect(postEdits({}, action)).to.deep.equal({})
    })

    it('updates post media', () => {
      let action = {
        type: UPLOAD_IMAGE,
        payload: 'http://foo.com/foo.gif',
        meta: {id: 'a', subject: 'post'}
      }

      let state = {
        a: {
          id: 'a',
          name: 'foo',
          media: [
            {type: 'gdoc', url: 'http://foo.com/foo.pdf'}
          ]
        }
      }

      let expectedState = {
        a: {
          id: 'a',
          name: 'foo',
          media: [
            {type: 'gdoc', url: 'http://foo.com/foo.pdf'},
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ]
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expectedState)
    })
  })
})

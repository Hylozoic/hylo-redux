require('../support')
import postEdits from '../../src/reducers/postEdits'
import {
  START_POST_EDIT,
  UPDATE_POST_EDITOR,
  UPLOAD_IMAGE
} from '../../src/actions'

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

  describe('on UPDATE_POST_EDITOR', () => {
    const action = {
      type: UPDATE_POST_EDITOR,
      payload: {name: 'Foo and some change as well'},
      meta: {id: 'x'}
    }

    it('suggests a tag for events with no id', () => {
      const state = {
        x: {
          description: 'lol',
          type: 'event'
        }
      }

      const expected = {
        x: {
          name: 'Foo and some change as well',
          description: 'lol',
          tag: 'FooAndSomeChange',
          type: 'event'
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })

    it('does not suggest a tag for non-event posts', () => {
      const state = {
        x: {
          description: 'lol'
        }
      }

      const expected = {
        x: {
          name: 'Foo and some change as well',
          description: 'lol'
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })

    it('does not suggest a tag when updating events', () => {
      const state = {
        x: {
          id: 'x',
          description: 'lol',
          type: 'event'
        }
      }

      const expected = {
        x: {
          id: 'x',
          name: 'Foo and some change as well',
          description: 'lol',
          type: 'event'
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })

    it('does not suggest a tag when tag field has been edited', () => {
      const state = {
        x: {
          description: 'lol',
          type: 'event',
          tagManuallyEdited: true
        }
      }

      const expected = {
        x: {
          name: 'Foo and some change as well',
          description: 'lol',
          tagManuallyEdited: true,
          type: 'event'
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })
  })
})

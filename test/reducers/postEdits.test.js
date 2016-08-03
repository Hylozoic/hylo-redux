require('../support')
import postEdits, { tagDescriptionEdits } from '../../src/reducers/postEdits'
import {
  START_POST_EDIT,
  UPDATE_POST_EDITOR,
  UPLOAD_IMAGE,
  CREATE_POST,
  EDIT_TAG_DESCRIPTION,
  EDIT_NEW_TAG_AND_DESCRIPTION
} from '../../src/actions'

describe('postEdits', () => {
  describe('on START_POST_EDIT', () => {
    it('sets up post attributes and media', () => {
      let action = {
        type: START_POST_EDIT,
        payload: {
          id: 'a',
          name: 'foo',
          type: 'event',
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
          description: '',
          type: 'event',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ]
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
      payload: {name: 'Foo and some! split-words as well'},
      meta: {id: 'x'}
    }

    it('suggests a tag for events with no id', () => {
      const state = {
        x: {
          description: 'lol',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false,
          type: 'event'
        }
      }

      const expected = {
        x: {
          name: 'Foo and some! split-words as well',
          description: 'lol',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false,
          tag: 'FooAndSomeSplit',
          type: 'event'
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })

    it('does not suggest a tag for non-event posts', () => {
      const state = {
        x: {
          description: 'lol',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false
        }
      }

      const expected = {
        x: {
          name: 'Foo and some! split-words as well',
          description: 'lol',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })

    it('does not suggest a tag when updating events', () => {
      const state = {
        x: {
          id: 'x',
          description: 'lol',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false,
          type: 'event'
        }
      }

      const expected = {
        x: {
          id: 'x',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false,
          name: 'Foo and some! split-words as well',
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
          financialRequestAmount: undefined,
          financialRequestsEnabled: false,
          type: 'event',
          tagEdited: true
        }
      }

      const expected = {
        x: {
          name: 'Foo and some! split-words as well',
          description: 'lol',
          financialRequestAmount: undefined,
          financialRequestsEnabled: false,
          tagEdited: true,
          type: 'event'
        }
      }

      expect(postEdits(state, action)).to.deep.equal(expected)
    })
  })
})

describe('tagDescriptionEdits', () => {
  const tag1 = 'tag1'
  const tag2 = 'tag2'

  describe('on START_POST_EDIT', () => {
    const action = {type: START_POST_EDIT}

    it('clears the state', () => {
      const state = {'atagname': 'the description'}
      expect(tagDescriptionEdits(state, action)).to.deep.equal({})
    })
  })

  describe('on CREATE_POST with missing tags error', () => {
    const action = {
      type: CREATE_POST,
      error: true,
      payload: {
        response: {
          body: `{"tagsMissingDescriptions": {"${tag1}": 1, "${tag2}": 1}}`
        }
      }
    }

    it('sets those tags for editing', () => {
      const state = {}
      const expectedState = {
        [tag1]: '',
        [tag2]: ''
      }
      expect(tagDescriptionEdits(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on EDIT_TAG_DESCRIPTION', () => {
    const action = {
      type: EDIT_TAG_DESCRIPTION,
      payload: {
        tag: tag1,
        description: 'new description'
      }
    }

    it('updates the correct tag', () => {
      const state = {
        [tag1]: 'first description',
        [tag2]: 'second description'
      }
      const expectedState = {
        [tag1]: action.payload.description,
        [tag2]: state[tag2]
      }
      expect(tagDescriptionEdits(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on EDIT_NEW_TAG_AND_DESCRIPTION it replaces current data with new tag', () => {
    const action = {
      type: EDIT_NEW_TAG_AND_DESCRIPTION,
      payload: {
        tag: 'newtag',
        description: 'new description'
      }
    }

    it('sets those tags for editing', () => {
      const state = {
        [tag1]: 'description'
      }
      const expectedState = {
        [action.payload.tag]: action.payload.description
      }
      expect(tagDescriptionEdits(state, action)).to.deep.equal(expectedState)
    })
  })
})

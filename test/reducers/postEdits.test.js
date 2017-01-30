require('../support')
import postEdits, { tagDescriptionEdits } from '../../src/reducers/postEdits'
import {
  START_POST_EDIT,
  UPDATE_POST_EDITOR,
  UPLOAD_IMAGE,
  CREATE_POST,
  EDIT_TAG_DESCRIPTION,
  EDIT_NEW_TAG_AND_DESCRIPTION
} from '../../src/constants'

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
})

describe('tagDescriptionEdits', () => {
  const tag1 = 'tag1'
  const tag2 = 'tag2'

  describe('on START_POST_EDIT', () => {
    const action = {type: START_POST_EDIT}

    it('clears the state', () => {
      const state = {'atagname': {description: 'the description', is_default: false}}
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
        [tag1]: {description: '', is_default: false},
        [tag2]: {description: '', is_default: false}
      }
      expect(tagDescriptionEdits(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on EDIT_TAG_DESCRIPTION', () => {
    const action = {
      type: EDIT_TAG_DESCRIPTION,
      payload: {
        tag: tag1,
        description: 'new description',
        is_default: true
      }
    }

    it('updates the correct tag', () => {
      const state = {
        [tag1]: {description: 'first description', is_default: false},
        [tag2]: {description: 'second description', is_default: true}
      }
      const expectedState = {
        [tag1]: {description: action.payload.description, is_default: action.payload.is_default},
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
        description: 'new description',
        is_default: true
      }
    }

    it('sets those tags for editing', () => {
      const state = {
        [tag1]: {description: 'description', is_default: false}
      }
      const expectedState = {
        [action.payload.tag]: {
          description: action.payload.description,
          is_default: action.payload.is_default
        }
      }
      expect(tagDescriptionEdits(state, action)).to.deep.equal(expectedState)
    })
  })
})

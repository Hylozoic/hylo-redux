require('../support')
import postsInProgress from '../../src/reducers/postsInProgress'
import { START_POST_EDIT } from '../../src/actions'

describe('postsInProgress', () => {
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

      expect(postsInProgress(state, action)).to.deep.equal(expectedState)
    })
  })
})

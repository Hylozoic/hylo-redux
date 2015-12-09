require('../support')
import { UPDATE_PROJECT_EDITOR } from '../../src/actions'
import projectEdits from '../../src/reducers/projectEdits'

describe('projectEdits', () => {
  describe('on UPDATE_PROJECT_EDITOR', () => {
    it('updates normal attributes', () => {
      let action = {
        type: UPDATE_PROJECT_EDITOR,
        payload: {intention: 'success!'},
        meta: {id: 'a'}
      }

      let state = {
        a: {
          title: 'foo',
          intention: 'failure',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ]
        }
      }

      let expectedState = {
        a: {
          title: 'foo',
          intention: 'success!',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ]
        }
      }

      expect(projectEdits(state, action)).to.deep.equal(expectedState)
    })

    it('updates video', () => {
      let videoUrl = 'https://www.youtube.com/watch?v=2x_jzFq6QQs'

      let action = {
        type: UPDATE_PROJECT_EDITOR,
        payload: {video: videoUrl},
        meta: {id: 'a'}
      }

      let state = {
        a: {
          title: 'foo',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'}
          ]
        }
      }

      let expectedState = {
        a: {
          title: 'foo',
          media: [
            {type: 'image', url: 'http://foo.com/foo.gif'},
            {type: 'video', url: videoUrl}
          ]
        }
      }

      expect(projectEdits(state, action)).to.deep.equal(expectedState)
    })
  })
})

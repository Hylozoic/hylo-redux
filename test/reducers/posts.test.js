require('../support')
import posts from '../../src/reducers/posts'
import { FETCH_POSTS } from '../../src/actions/fetchPosts'
import { UPDATE_POST } from '../../src/actions'

describe('posts', () => {
  describe('on FETCH_POSTS', () => {
    it('normalizes community data', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'a', name: 'hi', communities: [{id: 'c1'}, {id: 'c2'}]}]
        },
        meta: {
          cache: {id: 'foo'}
        }
      }

      let state = {}

      let expectedState = {
        a: {id: 'a', name: 'hi', communities: ['c1', 'c2']}
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on UPDATE_POST', () => {
    it('updates attributes', () => {
      let action = {
        type: UPDATE_POST,
        meta: {
          context: 'a',
          params: {name: 'through the woods'}
        }
      }

      let state = {
        a: {id: 'a', name: 'over the river', public: true},
        b: {id: 'b', name: "to grandmother's house"}
      }

      let expectedState = {
        a: {id: 'a', name: 'through the woods', public: true},
        b: {id: 'b', name: "to grandmother's house"}
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })

    it('updates an existing image', () => {
      let action = {
        type: UPDATE_POST,
        meta: {
          context: 'a',
          params: {imageUrl: 'http://new.com/new.png'}
        }
      }

      let state = {
        a: {
          id: 'a',
          name: 'over the river',
          media: [
            {type: 'image', url: 'http://old.com/old.png'},
            {type: 'gdoc', url: 'http://bar.com/doc.txt'}
          ]
        }
      }

      let expectedState = {
        a: {
          id: 'a',
          name: 'over the river',
          media: [
            {type: 'gdoc', url: 'http://bar.com/doc.txt'},
            {type: 'image', url: 'http://new.com/new.png'}
          ]
        }
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })

    it('removes an image', () => {
      let action = {
        type: UPDATE_POST,
        meta: {
          context: 'a',
          params: {imageUrl: 'http://new.com/new.png', imageRemoved: true}
        }
      }

      let state = {
        a: {
          id: 'a',
          name: 'over the river',
          media: [
            {type: 'image', url: 'http://old.com/old.png'},
            {type: 'gdoc', url: 'http://bar.com/doc.txt'}
          ]
        }
      }

      let expectedState = {
        a: {
          id: 'a',
          name: 'over the river',
          media: [
            {type: 'gdoc', url: 'http://bar.com/doc.txt'}
          ]
        }
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })

    it('adds an image', () => {
      let action = {
        type: UPDATE_POST,
        meta: {
          context: 'a',
          params: {imageUrl: 'http://new.com/new.png'}
        }
      }

      let state = {
        a: {
          id: 'a',
          name: 'over the river'
        }
      }

      let expectedState = {
        a: {
          id: 'a',
          name: 'over the river',
          media: [
            {type: 'image', url: 'http://new.com/new.png'}
          ]
        }
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })
  })
})

require('../support')
import posts from '../../src/reducers/posts'
import { FETCH_POSTS, FOLLOW_POST, UPDATE_POST } from '../../src/actions'

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

    it('merges with existing post data', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'a', name: 'hi', communities: []}]
        },
        meta: {
          cache: {id: 'foo'}
        }
      }

      let state = {
        a: {id: 'a', description: 'hello'}
      }

      let expectedState = {
        a: {id: 'a', name: 'hi', description: 'hello'}
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on UPDATE_POST', () => {
    it('updates attributes', () => {
      let action = {
        type: UPDATE_POST,
        meta: {
          id: 'a',
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
          id: 'a',
          params: {
            media: [
              {type: 'gdoc', url: 'http://bar.com/doc.txt'},
              {type: 'image', url: 'http://new.com/new.png'}
            ]
          }
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
          id: 'a',
          params: {media: [{type: 'gdoc', url: 'http://bar.com/doc.txt'}]}
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
          id: 'a',
          params: {media: [{type: 'image', url: 'http://new.com/new.png'}]}
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

  describe('on FOLLOW_POST', () => {
    let person = {id: 'person', name: 'person', avatar_url: 'http://people.com/me.png'}
    let cat = {id: 'cat', name: 'Cat', avatar_url: 'http://cats.com/me.png'}

    it('removes an existing follower', () => {
      let action = {
        type: FOLLOW_POST,
        meta: {id: 'a', person}
      }
      let state = {
        a: {name: 'post!', followers: [person, cat]}
      }

      let newState = posts(state, action)
      expect(newState.a.followers).to.deep.equal([cat])
    })

    it('adds the current user as follower', () => {
      let action = {
        type: FOLLOW_POST,
        meta: {id: 'a', person}
      }
      let state = {
        a: {name: 'post!', followers: [cat]}
      }

      let newState = posts(state, action)
      expect(newState.a.followers).to.deep.equal([cat, person])
    })
  })
})

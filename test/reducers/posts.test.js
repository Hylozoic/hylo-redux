require('../support')
import posts from '../../src/reducers/posts'
import { FETCH_POSTS, FOLLOW_POST_PENDING, UPDATE_POST } from '../../src/actions'

describe('posts', () => {
  describe('on FETCH_POSTS', () => {
    it('merges with existing post data', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'a', name: 'hi'}]
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

    it('sets pins field correctly', () => {
      let action = {
        type: FETCH_POSTS,
        payload: {
          posts: [{id: 'a', name: 'hi', memberships: {c3: {pinned: true}}}]
        },
        meta: {
          cache: {id: 'foo'},
          communityId: 'c3'
        }
      }

      let state = {
        a: {id: 'a', description: 'hello', memberships: {c1: {pinned: true}, c2: {pinned: false}}}
      }

      let expectedState = {
        a: {
          id: 'a', name: 'hi', description: 'hello',
          memberships: {
            c1: {pinned: true}, c2: {pinned: false}, c3: {pinned: true}
          }
        }
      }

      expect(posts(state, action)).to.deep.equal(expectedState)
    })
  })

  describe('on UPDATE_POST', () => {
    it('updates attributes', () => {
      let action = {
        type: UPDATE_POST,
        payload: {},
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
        payload: {},
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
        payload: {},
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
        payload: {},
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

    it('adds a link preview', () => {
      const action = {
        type: UPDATE_POST,
        payload: {},
        meta: {id: 'a', params: {linkPreview: {id: 'b', url: 'foo'}}}
      }

      const state = {
        a: {id: 'a'}
      }

      expect(posts(state, action)).to.deep.equal({
        a: {id: 'a', linkPreview: {id: 'b', url: 'foo'}}
      })
    })

    it('removes a link preview', () => {
      const action = {
        type: UPDATE_POST,
        payload: {},
        meta: {id: 'a', params: {}}
      }

      const state = {
        a: {id: 'a', linkPreview: {id: 'b'}}
      }

      expect(posts(state, action)).to.deep.equal({
        a: {id: 'a'}
      })
    })
  })

  describe('on FOLLOW_POST', () => {
    let person = {id: 'person', name: 'person', avatar_url: 'http://people.com/me.png'}
    let cat = {id: 'cat', name: 'Cat', avatar_url: 'http://cats.com/me.png'}

    it('removes an existing follower', () => {
      let action = {
        type: FOLLOW_POST_PENDING,
        meta: {id: 'a', personId: person.id}
      }
      let state = {
        a: {name: 'post!', follower_ids: [person.id, cat.id]}
      }

      let newState = posts(state, action)
      expect(newState.a.follower_ids).to.deep.equal([cat.id])
    })

    it('adds the current user as follower', () => {
      let action = {
        type: FOLLOW_POST_PENDING,
        meta: {id: 'a', personId: person.id}
      }
      let state = {
        a: {name: 'post!', follower_ids: [cat.id]}
      }

      let newState = posts(state, action)
      expect(newState.a.follower_ids).to.deep.equal([cat.id, person.id])
    })
  })
})

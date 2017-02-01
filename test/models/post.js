import '../support'
import * as postModel from '../../src/models/post'

describe('post', () => {
  describe('.isChildPost', () => {
    it('returns truthy if post has a parent id', () => {
      let post = { parent_post_id: 'parent' }
      expect(postModel.isChildPost(post)).to.be.truthy
    })
    it('returns falsey if post has a null parent_post_id', () => {
      let post = { parent_post_id: null }
      expect(postModel.isChildPost(post)).to.be.falsey
    })

    it('returns falsey if post has not parent_post_id key', () => {
      let post = {}
      expect(postModel.isChildPost(post)).to.be.falsey
    })
  })

  describe('.isCompleteRequest', () => {
    it('returns truthy if has fulfilled date', () => {
      let post = { fulfilled_at: '1/1/1900' }
      expect(postModel.isCompleteRequest(post)).to.be.truthy
    })
    it('returns falsey if post has a null fulfilled date', () => {
      let post = { fulfilled_at: null }
      expect(postModel.isCompleteRequest(post)).to.be.falsey
    })
    it('returns falsey if post has not parent_post_id key', () => {
      let post = {}
      expect(postModel.isCompleteRequest(post)).to.be.falsey
    })
  })
})

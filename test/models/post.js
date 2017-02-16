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

  describe('.isRequest', () => {
    it('returns true if the post is a request', () => {
      let post = {tag: 'request'}
      expect(postModel.isRequest(post)).to.be.true
    })

    it('returns false if post isn\'t of request types', () => {
      let post = { tag: null }
      expect(postModel.isCompleteRequest(post)).to.be.false
    })
  })

  describe('.isCompleteRequest', () => {
    it('returns true if the request has a fulfilled date', () => {
      let post = {fulfilled_at: '1/1/1900', tag: 'request'}
      expect(postModel.isCompleteRequest(post)).to.be.true
    })

    it('returns false if the request does not have a fulfilled date', () => {
      let post = {fulfilled_at: null, tag: 'request'}
      expect(postModel.isCompleteRequest(post)).to.be.false
    })

    it('returns false if the post has a fulfilled date but is not a request', () => {
      let post = {fulfilled_at: '1/1/1900'}
      expect(postModel.isCompleteRequest(post)).to.be.false
    })
  })
})

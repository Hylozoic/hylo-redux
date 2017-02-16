import '../../support'
import React from 'react'
import { merge } from 'lodash'
import { shallow } from 'enzyme'
import Post from '../../../src/components/Post/component'

const minProps = {
  post: {communities: [{slug: 'testcommunity'}]},
  actions: {
    voteOnPost: () => {}
  },
  comments: []
}

const requiredContext = {
  currentUser: {id: 'x'}
}

function renderComponent (props) {
  return shallow(<Post {...merge({}, minProps, props)} />, {context: requiredContext})
}

describe('<Post />', () => {
  before(() => {
    process.env.FEATURE_FLAG_CONTRIBUTORS = 'on' // window.FEATURE_FLAGS = { CONTRIBUTORS: 'on' }
  })

  after(() => {
    delete process.env.FEATURE_FLAG_CONTRIBUTORS // delete window.FEATURE_FLAGS
  })

  it('will render with minimum required props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('.post').length).to.equal(1)
  })

  describe('with an image on the provided post', () => {
    const props = {post: {media: [{type: 'image', url: 'imageurl'}]}}

    it('styles for an image', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('.post.image').length).to.equal(1)
    })

    it('presents the image', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('img').length).to.equal(1)
      expect(wrapper.find('img').prop('src')).to.equal('imageurl')
    })
  })

  it('by default is not expanded', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('.post.expanded').length).to.equal(0)
  })

  it('styles for expanded', () => {
    const props = {expanded: true}
    const wrapper = renderComponent(props)
    expect(wrapper.find('.post.expanded').length).to.equal(1)
  })

  it('styles a tagged post', () => {
    const props = {post: {tag: 'test-tag'}}
    const wrapper = renderComponent(props)
    expect(wrapper.find('.post.test-tag').length).to.equal(1)
  })

  it('should show a post link preview if provided', () => {
    const props = {post: {linkPreview: 'linkpreview'}}
    const wrapper = renderComponent(props)
    expect(wrapper.find('LinkPreview').length).to.equal(1)
  })

  it('passes community', () => {
    const props = {post: {communities: [{slug: 'passedcommunity'}]}}
    const wrapper = renderComponent(props)
    expect(wrapper.find('PostDetails').prop('community'))
    .to.deep.equal(props.post.communities[0])
  })

  it('should have the complete request feature when the post is a request', () => {
    const props = {post: {tag: 'request'}}
    const wrapper = renderComponent(props)
    expect(wrapper.find('Connect(RequestHeader)').length).to.equal(1)
  })

  describe('with a parent post', () => {
    const props = {
      post: {communities: [{slug: 'foo'}, {slug: 'bar'}]},
      parentPost: {communities: [{slug: 'goo'}, {slug: 'car'}]}
    }

    it('inherits communities from the parent', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(PostHeader)').prop('communities'))
      .to.deep.equal(props.parentPost.communities)
    })

    it('passes the prop to the header', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(PostHeader)').prop('parentPost'))
      .to.deep.equal(props.parentPost)
    })
  })

  describe('with comments', () => {
    const comments = [{id: '1'}, {id: '2'}]
    it('comments are passed as a prop for comments component', () => {
      const props = {comments}
      const wrapper = renderComponent(props)
      expect(wrapper.find('CommentSection').prop('comments'))
      .to.deep.equal(props.comments)
    })

    it('should send only the last comment if not expanded and in an activity card', () => {
      const props = {inActivityCard: true, expanded: false, comments}
      const wrapper = renderComponent(props)
      expect(wrapper.find('CommentSection').prop('comments')).to.deep.equal(props.comments.slice(-1))
    })
  })
})

import '../../support'
import { createElement } from '../../support/helpers'
import { merge } from 'lodash'
import { renderToString } from 'react-dom/server'
import cheerio from 'cheerio'
import decode from 'ent/decode'
import React from 'react'
import { shallow } from 'enzyme'
import Post, { Details, Voters } from '../../../src/components/Post/component'

const requiredProps = {
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
  return shallow(<Post {...merge(requiredProps, props)} />, {context: requiredContext})
}

describe('Post', () => {
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
    expect(wrapper.find('Details').prop('community'))
    .to.deep.equal(props.post.communities[0])
  })

  // it('should have the complete request feature if enabled and the post is a request', () => {
  //   // LEJ: Need to make a window mock for this unit testing
  //   //      context or move FEATURE_FLAGS to a "features" prop
  //   window.FEATURE_FLAGS = { CONTRIBUTORS: 'on' }
  //   const props = {post: {tag: 'request'}}
  //   const wrapper = renderComponent(props)
  //   expect(wrapper.find('Connect(CompleteRequest)').length).to.equal(1)
  //   delete window.FEATURE_FLAGS
  // })

  describe('with a parent post', () => {
    const props = {
      post: {communities: {foo: {}, bar: {}}},
      parentPost: {communities: {goo: {}, car: {}}}
    }

    it('inherits communities from the parent', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('Connect(PostHeader)').prop('communities'))
      .to.deep.equal(props.parentPost.communities)
    })

    it('inherits passes the prop to the header', () => {
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

describe('Details', () => {
  it('extracts tags from truncated description text', () => {
    const description = `Please let me know what <a>#software</a> you recommend and i
    can start working on it, and then help me for about an hour to get
    accustomed to the program? It is preferable that the software is free and
    user friendly. Can offer compensation in the form of plants or ca$h. thank
    you!! #permaculture <a>#design</a> #support`
    const props = {post: { description }, community: {}}
    const wrapper = shallow(<Details {...props} />, {context: requiredContext})
    expect(wrapper.find('HashtagLink').length).to.equal(3)
    const tags = wrapper.find('HashtagLink').map((node) => node.prop('tag'))
    expect(tags).to.deep.equal(['permaculture', 'design', 'support'])
    expect(wrapper.find('.show-more').length).to.equal(1)
  })
})

// TODO: These are mostly just LinkedPersonSentence tests now
describe('Voters', () => {
  const currentUser = {id: 'x'}
  const voters = [
    {id: 'y', name: 'Sneezy'},
    {id: 'z', name: 'Itchy'},
    {id: 'w', name: 'Goofy'},
    {id: 'a', name: 'Sleepy'},
    {id: 'b', name: 'Doc'}
  ]

  const renderWithVoters = voters => {
    let component = createElement(Voters, {post: {voters}, stateless: true}, { currentUser })
    return renderToString(component)
  }

  const expectTopText = ($, text) =>
    expect($.root().text()).to.equal(decode(text))

  const test = (voters, text) => () => {
    const $ = cheerio.load(renderWithVoters(voters))
    $('.dropdown li').remove()
    expectTopText($, text)
  }

  it('handles one voter',
    test([voters[0]], 'Sneezy liked this.'))

  it('handles the current user as a voter',
    test([currentUser], 'You liked this.'))

  it('handles the current user and one other voter',
    test([currentUser, voters[0]], 'You and Sneezy liked this.'))

  it('handles 2 voters',
    test(voters.slice(0, 2), 'Sneezy and Itchy liked this.'))

  it('handles the current user and 2 other voters',
    test([currentUser, ...voters.slice(0, 2)], 'You, Sneezy, and Itchy liked this.'))

  it('handles 3 voters',
    test(voters.slice(0, 3), 'Sneezy, Itchy, and 1 other liked this.'))

  it('handles 4 voters',
    test(voters.slice(0, 4), 'Sneezy, Itchy, and 2 others liked this.'))

  it('handles 5 voters',
    test([currentUser, ...voters], 'You, Sneezy, Itchy, and 3 others liked this.'))
})

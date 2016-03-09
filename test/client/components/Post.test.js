require('../support')
import { mocks, helpers } from '../../support'
import { UndecoratedPost, Followers } from '../../../src/components/Post'
import Post from '../../../src/components/Post'
import React from 'react'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument,
  Simulate
} from 'react-addons-test-utils'
import { Provider } from 'react-redux'
import cheerio from 'cheerio'
import decode from 'ent/decode'

let post = {
  id: 'p',
  name: 'i have something for you!',
  description: 'it is very special.',
  type: 'offer',
  created_at: new Date(),
  updated_at: new Date(),
  user: {
    id: 'x',
    name: 'Mr. X',
    avatar_url: '/img/mrx.png'
  }
}

let state = {}

describe('UndecoratedPost', () => {
  let component, node, expand
  before(() => {
    expand = spy(() => {})
    component = <UndecoratedPost post={post} onExpand={expand}/>
    node = renderIntoDocument(component)
  })

  it('renders', () => {
    findRenderedDOMComponentWithClass(node, 'post offer')
    let title = findRenderedDOMComponentWithClass(node, 'title')
    expect(title.innerHTML).to.equal(post.name)
  })

  it('calls onExpand on click', () => {
    let outerDiv = findRenderedDOMComponentWithClass(node, 'post offer')
    Simulate.click(outerDiv)
    expect(expand).to.have.been.called()
  })
})

describe('Post', () => {
  it('renders expanded', () => {
    let component = <Provider store={mocks.redux.store(state)}>
      <Post post={post} expanded={true}/>
    </Provider>
    let node = renderIntoDocument(component)
    findRenderedDOMComponentWithClass(node, 'post offer expanded')
    let details = findRenderedDOMComponentWithClass(node, 'details')
    expect(details.innerHTML).to.equal(`<p>${post.description}</p>`)
  })
})

describe('Followers', () => {
  const currentUser = {id: 'x'}
  const followers = [
    {id: 'y', name: 'Sneezy'},
    {id: 'z', name: 'Itchy'},
    {id: 'w', name: 'Goofy'},
    {id: 'a', name: 'Sleepy'},
    {id: 'b', name: 'Doc'}
  ]

  const renderWithFollowers = followers => {
    let component = helpers.createElement(Followers, {stateless: true}, {
      post: {followers}, currentUser
    })
    let node = renderIntoDocument(component)
    return findRenderedDOMComponentWithClass(node, 'followers')
  }

  const expectTopText = ($, text) =>
    expect($.root().text()).to.equal(decode(text))

  const test = (followers, text) => () => {
    let node = renderWithFollowers(followers)
    let $ = cheerio.load(node.innerHTML)
    $('.dropdown li').remove()
    expectTopText($, text)
  }

  it('handles one follower',
    test([followers[0]], 'Sneezy&nbsp;is following this.'))

  it('handles the current user as a follower',
    test([currentUser], 'You&nbsp;are following this.'))

  it('handles the current user and one other follower',
    test([currentUser, followers[0]], 'You and Sneezy&nbsp;are following this.'))

  it('handles 2 followers',
    test(followers.slice(0, 2), 'Sneezy and Itchy&nbsp;are following this.'))

  it('handles the current user and 2 other followers',
    test([currentUser, ...followers.slice(0, 2)], 'You, Sneezy, and Itchy&nbsp;are following this.'))

  it('handles 3 followers',
    test(followers.slice(0, 3), 'Sneezy, Itchy, and 1 other&nbsp;are following this.'))

  it('handles 4 followers',
    test(followers.slice(0, 4), 'Sneezy, Itchy, and 2 others&nbsp;are following this.'))

  it('handles 5 followers',
    test([currentUser, ...followers], 'You, Sneezy, Itchy, and 3 others&nbsp;are following this.'))
})

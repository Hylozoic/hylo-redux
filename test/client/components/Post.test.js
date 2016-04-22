require('../support')
import { mocks, helpers } from '../../support'
import { Voters } from '../../../src/components/Post'
import Post from '../../../src/components/Post'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'
import cheerio from 'cheerio'
import decode from 'ent/decode'

let post = {
  id: 'p',
  name: 'i have &quot;something&quot; for you!',
  description: 'it is very special.',
  type: 'offer',
  tag: 'offer',
  created_at: new Date(),
  updated_at: new Date(),
  user: {
    id: 'x',
    name: 'Mr. X',
    avatar_url: '/img/mrx.png'
  },
  communities: ['f']
}

let communities = [
  {id: 'f', name: 'Foomunity'}
]

let state = {
  communities: {
    f: communities[0]
  },
  people: {
    current: {
      id: 'x',
      name: 'Mr. X',
      avatar_url: '/img/mrx.png'
    }
  }
}

describe('Post', () => {
  it('renders expanded', () => {
    const props = {post, expanded: true}
    const context = {store: mocks.redux.store(state), dispatch: () => {}}
    let component = helpers.createElement(Post, props, context)
    let node = renderIntoDocument(component)
    findRenderedDOMComponentWithClass(node, 'post')
    let details = findRenderedDOMComponentWithClass(node, 'details')
    let expected = new RegExp(`<span [^>]*><p>${post.description}&nbsp;<\/p><\/span><a class="hashtag" [^>]*>#offer<\/a>`)
    expect(details.innerHTML).to.match(expected)
    let title = findRenderedDOMComponentWithClass(node, 'title')
    expect(title.innerHTML).to.equal('i have "something" for you!')
  })
})

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
    let component = helpers.createElement(Voters, {stateless: true}, {
      post: {voters}, currentUser
    })
    let node = renderIntoDocument(component)
    return findRenderedDOMComponentWithClass(node, 'voters')
  }

  const expectTopText = ($, text) =>
    expect($.root().text()).to.equal(decode(text))

  const test = (voters, text) => () => {
    let node = renderWithVoters(voters)
    let $ = cheerio.load(node.innerHTML)
    $('.dropdown li').remove()
    expectTopText($, text)
  }

  it('handles one voter',
    test([voters[0]], 'Sneezy&nbsp;liked this.'))

  it('handles the current user as a voter',
    test([currentUser], 'You&nbsp;liked this.'))

  it('handles the current user and one other voter',
    test([currentUser, voters[0]], 'You and Sneezy&nbsp;liked this.'))

  it('handles 2 voters',
    test(voters.slice(0, 2), 'Sneezy and Itchy&nbsp;liked this.'))

  it('handles the current user and 2 other voters',
    test([currentUser, ...voters.slice(0, 2)], 'You, Sneezy, and Itchy&nbsp;liked this.'))

  it('handles 3 voters',
    test(voters.slice(0, 3), 'Sneezy, Itchy, and 1 other&nbsp;liked this.'))

  it('handles 4 voters',
    test(voters.slice(0, 4), 'Sneezy, Itchy, and 2 others&nbsp;liked this.'))

  it('handles 5 voters',
    test([currentUser, ...voters], 'You, Sneezy, Itchy, and 3 others&nbsp;liked this.'))
})

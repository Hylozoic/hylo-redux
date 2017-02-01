require('../support')
import { renderToString } from 'react-dom/server'
import { Details, Voters } from '../../src/components/Post'
import cheerio from 'cheerio'
import decode from 'ent/decode'
import { createElement } from '../support/helpers'

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

describe('Post Details', () => {
  it('extracts tags from truncated description text', () => {
    const description = `Please let me know what <a>#software</a> you recommend and i
    can start working on it, and then help me for about an hour to get
    accustomed to the program? It is preferable that the software is free and
    user friendly. Can offer compensation in the form of plants or ca$h. thank
    you!! #permaculture <a>#design</a> #support`

    const props = {
      stateless: true,
      post: {description, tag: 'request'}
    }
    const context = {
      community: {slug: 'foo'},
      dispatch: () => {}
    }

    const component = createElement(Details, props, context)
    const html = renderToString(component)
    const doc = cheerio.load(html)
    expect(doc('.show-more').length).to.equal(1)
    expect(doc('span > .hashtag').text()).to.equal('#permaculture#design#support')
  })
})

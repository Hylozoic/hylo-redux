require('../support')
import { mount } from 'enzyme'
import React from 'react'
import Comment from '../../../src/components/Comment'
import { configureStore } from '../../../src/store'
const { object } = React.PropTypes

const currentUser = {id: '5', name: 'me'}

describe('Comment', () => {
  var comment, store, node

  beforeEach(() => {
    comment = {id: '1', text: 'yes!', user: {id: '6', name: 'jo klunk'}}
  })

  const render = () => {
    store = configureStore({
      people: {current: currentUser},
      comments: {[comment.id]: comment}
    }).store

    node = mount(<Comment comment={comment}/>, {
      context: {store, dispatch: store.dispatch, currentUser},
      childContextTypes: {store: object, currentUser: object}
    })
  }

  it('behaves as expected', () => {
    render()
    expect(node.find('.content .text').text())
    .to.equal('jo' + String.fromCharCode(160) + 'klunk' + 'yes!')

    expect(node.find('.content .text').html())
    .to.include('<strong class="name">jo&nbsp;klunk</strong>')

    expect(node.find('.content > div > span a').text()).to.equal('Say thanks')

    node.find('a.thanks').simulate('click')
    node.setProps({comment: store.getState().comments[comment.id]})
    expect(node.find('.content > div > span a').text()).to.equal('You thanked jo')
  })

  it('allows editing', () => {
    comment.user = currentUser
    render()

    node.find('.dropdown-toggle').simulate('click')
    expect(node.find('.dropdown li a').length).to.equal(2)
    node.find('.dropdown li a').first().simulate('click')
    expect(node.find('.comment-form').length).to.equal(1)
  })
})

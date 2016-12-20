import support from '../support' // eslint-disable-line no-unused-vars
import React from 'react'
import { mount } from 'enzyme'
import App from '../../../src/containers/App'
import { configureStore } from '../../../src/store'
import { showPopover } from '../../../src/actions'

describe('PersonPopover', () => {
  var store

  const tag = {
    description: 'just a regular tag',
    follower_count: 6,
    post_count: 10,
    active_members: [{
      id: '1',
      name: 'Mr R',
      avatar_url: '',
      post_count: 3
    }, {
      id: '2',
      name: 'Mrs S',
      avatar_url: '',
      post_count: 2
    }, {
      id: '3',
      name: 'Mr T',
      avatar_url: '',
      post_count: 2
    }]
  }

  const slug = 'slug'
  const tagName = 'tagName'

  beforeEach(() => {
    store = configureStore({
      tagsByCommunity: {
        [slug]: {
          [tagName]: tag
        }
      }
    }).store
  })

  it('displays when popover.type is tag', function () {
    const node = mount(<App><span className='theLink' /></App>, {
      context: {store}
    })

    const theLink = node.find('.theLink').get(0)

    store.dispatch(showPopover('tag', {tagName, slug}, theLink))

    const popover = node.find('.popover .p-tag')

    expect(popover.find('.tag-name').first().text()).to.equal('#' + tagName)
    expect(popover.find('.description').first().text()).to.equal(tag.description)
    expect(popover.find('.name').map(n => n.text()))
    .to.deep.equal(tag.active_members.map(m => m.name))
  })
})

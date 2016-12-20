import support from '../support' // eslint-disable-line no-unused-vars
import React from 'react'
import { mount } from 'enzyme'
import App from '../../../src/containers/App'
import { configureStore } from '../../../src/store'
import { showPopover } from '../../../src/actions'

describe('PersonPopover', () => {
  var store

  const user = {
    name: 'Mr X',
    id: 'x',
    bio: 'incognito'
  }

  beforeEach(() => {
    store = configureStore({
      people: {
        [user.id]: user
      }
    }).store
  })

  it('displays when popover.type is person', function () {
    const node = mount(<App><span className='theLink' /></App>, {
      context: {store}
    })

    const theLink = node.find('.theLink').get(0)

    store.dispatch(showPopover('person', {userId: 'x'}, theLink))

    const popover = node.find('.popover .p-person')

    expect(popover.find('.name').first().text()).to.equal(user.name)
    expect(popover.find('.bio').first().text()).to.equal(user.bio + '...')
  })
})

import support from '../support' // eslint-disable-line no-unused-vars
import React from 'react'
import { mount } from 'enzyme'
import { mockActionResponse } from '../../support/helpers'
import { fetchPerson } from '../../../src/actions/people'
import App from '../../../src/containers/App'
import { configureStore } from '../../../src/store'
import { showPopover } from '../../../src/actions'

describe('PersonPopover', () => {
  var store, node, link

  const u1 = {
    name: 'Mr X',
    id: 'x',
    bio: 'incognito: Lorem ipsum dolor sit amet, consectetur adipiscing elit.'
  }

  const u2 = {
    name: 'Mr Y',
    id: 'y',
    bio: 'y not?',
    shared_communities: ['z']
  }

  beforeEach(() => {
    store = configureStore({
      people: {
        [u1.id]: u1,
        [u2.id]: u2
      }
    }).store

    node = mount(<App><span className='link' /></App>, {
      context: {store}
    })

    link = node.find('.link').get(0)
  })

  // it('displays without a Message button', function () {
  //   const fetchedUser = {
  //     id: '1',
  //     bio: 'my life',
  //     name: 'Cran Berry'
  //   }
  //   mockActionResponse(fetchPerson('1'), fetchedUser)
  //   store.dispatch(showPopover('person', {userId: fetchedUser.id}, link))
  //   const popover = node.find('.popover .p-person')
  //   expect(popover.find('.name').first().text()).to.equal(fetchedUser.name)
  //   expect(popover.find('.bio').first().text()).to.equal(fetchedUser.bio)
  //   expect(popover.find('.message').length).to.equal(0)
  // })

  it('displays without a Message button', function () {
    store.dispatch(showPopover('person', {userId: u1.id}, link))
    const popover = node.find('.popover .p-person')
    expect(popover.find('.name').first().text()).to.equal(u1.name)
    expect(popover.find('.bio').first().text()).to.equal('incognito: Lorem ipsum dolor sit …')
    expect(popover.find('.message').length).to.equal(0)
  })

  it('displays with a Message button', () => {
    store.dispatch(showPopover('person', {userId: u2.id}, link))
    const popover = node.find('.popover .p-person')
    expect(popover.find('.name').first().text()).to.equal(u2.name)
    expect(popover.find('.bio').first().text()).to.equal(u2.bio)
    expect(popover.find('.message').length).to.equal(1)
  })
})

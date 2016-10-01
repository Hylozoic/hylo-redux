require('../support')
import { mount } from 'enzyme'
import React from 'react'
import PersonProfile from '../../../src/containers/person/PersonProfile'
import { configureStore } from '../../../src/store'

describe('PersonProfile', () => {
  it('renders without errors', () => {
    const store = configureStore({
      people: {
        '17': {
          id: '17',
          name: 'William Penn',
          grouped_post_count: {
            request: 3, offer: 5
          },
          facebook_url: 'http://myspace.com/lol',
          twitter_name: 'levity'
        }
      }
    }).store

    const props = {
      params: {id: '17'},
      location: { query: {} }
    }

    const node = mount(<PersonProfile {...props}/>, {context: {store}})
    expect(node.find('h2').first().text()).to.equal('William Penn')
  })
})

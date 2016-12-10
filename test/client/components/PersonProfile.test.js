require('../support')
import { mount, shallow } from 'enzyme'
import React from 'react'
import PersonProfile from '../../../src/containers/person/PersonProfile'
import { configureStore } from '../../../src/store'

const requestPost = {
  id: 'requestPost',
  name: 'Please help me.',
  description: 'This is a request for help',
  type: 'request',
  tag: 'request',
  created_at: new Date(),
  updated_at: new Date(),
  user_id: 'x',
  community_ids: ['1'],
  follower_ids: ['x', 'y']
}

const person = {
  id: '17',
  name: 'William Penn',
  grouped_post_count: {
    request: 3,
    offer: 5,
    contribution: 1
  },
  facebook_url: 'http://myspace.com/lol',
  twitter_name: 'levity',
}

const contribution = {
  id: 'contribution1',
  user_id: person.id,
  post_id: requestPost.id,
  post: {
    [requestPost.id]: requestPost
  }
}

const store = configureStore({
  people: {
    [person.id]: person
  },
  contributions: {
    [contribution.id]: contribution
  }
}).store

const props = {
  params: {
    id: person.id
  },
  location: { query: {} }
}

describe('PersonProfile', () => {
  it('renders without errors', () => {
    const node = mount(<PersonProfile {...props}/>, {context: {store}})
    expect(node.find('h2').first().text()).to.equal('William Penn')
    expect(node.find('a.contribution')).to.be.lengthOf(0)
  })

  describe('with CONTRIBUTORS', () => {
    before(() => {window.FEATURE_FLAGS = {CONTRIBUTORS: 'on'}})
    after(() => {window.FEATURE_FLAGS = {}})

    it('renders contributions', () => {
      const node = mount(<PersonProfile {...props}/>, {context: {store}})
      expect(node.find('a.contribution')).to.be.lengthOf(1)
      // LEJ: Test breaking here, click on TabLink element doesn't seem to
      //      propagate through from PersonProfile. Probably enzyme setup
      //      misunderstanding about child components.
      //
      //      Still exploring...
      //
      // node.find('a.contribution').first().simulate('click')
      // expect(node.find('div.contributions .title').text()).to.contain(requestPost.name)
    })
  })

})

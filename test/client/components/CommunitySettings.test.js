require('../support')
import { mount } from 'enzyme'
import React from 'react'
import CommunitySettings from '../../../src/containers/community/CommunitySettings'
import { configureStore } from '../../../src/store'

const community = {
  id: '1',
  slug: 'foomunity',
  name: 'Foom Unity',
  description: 'Social cohesion in the face of AI hard takeoff'
}

const currentUser = {
  id: '5',
  memberships: {
    community_id: community.id
  }
}

describe('CommunitySettings', () => {
  var store

  beforeEach(() => {
    store = configureStore({
      communities: {[community.slug]: community},
      people: {current: currentUser}
    }).store
  })

  it('renders without errors', () => {
    const props = {
      location: {query: {expand: 'appearance'}},
      params: {id: community.slug}
    }

    const node = mount(<CommunitySettings {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    expect(node.find('.section-label').map(n => n.text().trim()))
    .to.deep.equal(['Appearance', 'Access', 'Moderation', 'Advanced'])

    expect(node.find('.appearance .section-item label').first().text())
    .to.equal('Name')

    expect(node.find('.appearance .section-item p').first().text())
    .to.equal('Foom Unity')
  })

  it('shows a Slack error', () => {
    const props = {
      location: {query: {slackerror: true}},
      params: {id: community.slug}
    }

    const node = mount(<CommunitySettings {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    expect(node.find('.advanced .alert').first().text())
    .to.equal('There was an error connecting this community to your Slack team.')
  })

  it('allows editing', () => {
    const props = {
      location: {query: {}},
      params: {id: community.slug}
    }

    const node = mount(<CommunitySettings {...props}/>, {
      context: {store, currentUser},
      childContextTypes: {currentUser: React.PropTypes.object}
    })

    node.find('.section-label').first().simulate('click')
    expect(node.find('.appearance .section-item p').first().text())
    .to.equal('Foom Unity')

    node.find('.appearance button').first().simulate('click')
    expect(node.find('.appearance form[name="nameForm"]').length).to.equal(1)

    node.find('form[name="nameForm"] input').simulate('change', {
      target: {value: 'Foam MUNI Tee'}
    })
    node.find('.appearance button').at(1).simulate('click')

    expect(node.find('.appearance .section-item p').first().text())
    .to.equal('Foam MUNI Tee')
  })
})

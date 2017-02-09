require('../support')
import React from 'react'
import { shallow } from 'enzyme'
import BrowseTopicsModal from '../../../src/components/BrowseTopicsModal/component'

describe('BrowseTopicsModal', () => {
  var node, store, currentUser

  const community = {
    id: '1',
    slug: 'coo',
    name: 'Coomunity'
  }

  const tags = [
    {
      id: 1,
      name: 'request',
      memberships: [{
        community_id: '1',
        description: 'a',
        owner: null,
        follower_count: 5
      }]
    },
    {
      id: 2,
      name: 'offer',
      memberships: [{
        community_id: '1',
        description: 'Description for the offer tag',
        owner: null,
        follower_count: 6
      }]
    },
    {
      id: 3,
      name: 'intention',
      memberships: [{
        community_id: '1',
        description: 'b',
        owner: {
          id: 123,
          name: 'Mr Tag Creator'
        },
        follower_count: 7
      }]
    },
    {
      id: 4,
      name: 'fourthtag',
      memberships: [{
        community_id: '1',
        description: 'c',
        owner: null,
        follower_count: 1
      }]
    }
  ]

  const initialState = {
    communities: {
      coo: community
    },
    currentCommunityId: '1',
    tagsByQuery: {
      'subject=community&id=coo': tags
    },
    totalTagsByQuery: tags.length
  }

  describe('with onboarding set', () => {
    beforeEach(() => {
      node = shallow(<BrowseTopicsModal onboarding
        community={community} />)
    })

    it('renders correctly', () => {
      expect(node.find('.title h2').first().text())
      .to.equal('What are you interested in?')
      expect(node.find('.subtitle').first().text())
      .to.equal("Follow the topics you're interested in to join the conversation with other members.")
      expect(node.find('.name').map(l => l.text()))
      .to.deep.equal(tags.map(t => `# ${t.name}`))

      expect(node.find('.description').at(1).text()).to.equal('Description for the offer tag')
      expect(node.find('li .meta a').first().text()).to.equal('Mr Tag Creator')
      expect(node.find('.followers .count').at(3).text()).to.equal('1')
    })
  })
})

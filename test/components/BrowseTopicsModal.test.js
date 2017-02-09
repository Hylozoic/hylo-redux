import '../support'
import React from 'react'
import { shallow } from 'enzyme'
import BrowseTopicsModal from '../../src/components/BrowseTopicsModal/component'

describe('BrowseTopicsModal', () => {

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

  it('renders with minimal props', () => {
    const node = shallow(<BrowseTopicsModal community={community} />)
    const container = node.find('#browse-all-topics')
    expect(container.prop('title')).to.equal('Browse all topics')
  })

  it('renders for onboarding', () => {
    const props = {onboarding: true, community, tags}
    const node = shallow(<BrowseTopicsModal {...props} />)
    const container = node.find('#browse-all-topics')
    expect(container.prop('title'))
    .to.equal('What are you interested in?')
    expect(container.prop('subtitle'))
    .to.equal("Follow the topics you're interested in to join the conversation with other members.")

    const tagRows = node.find('TagRow')
    expect(tagRows.length).to.equal(4)
    expect(tagRows.at(2).prop('tag')).to.deep.equal(tags[2])
  })
})

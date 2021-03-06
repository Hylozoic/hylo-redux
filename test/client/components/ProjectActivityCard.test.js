import '../support'
import { mount } from 'enzyme'
import React from 'react'
import { configureStore } from '../../../src/store'
import ProjectActivityCard from '../../../src/components/ProjectActivityCard/component'

const state = {
  people: {
    'x': {
      name: 'Mr X',
      id: 'x',
      avatar_url: 'image.png'
    }
  },
  communities: {
    testcommunity: {slug: 'testcommunity'}
  }

}

const post = {
  name: 'The Request Post',
  user_id: 'x'
}

const parentPost = {
  id: 'parentPost',
  name: 'The Parent Project',
  created_at: new Date(),
  community_ids: ['testcommunity']
}

const setupNode = () => {
  const store = configureStore(state).store
  return mount(<ProjectActivityCard post={post} parentPost={parentPost} />, {
    context: { store, dispatch: () => {} },
    childContextTypes: {store: React.PropTypes.object, dispatch: React.PropTypes.func}
  })
}

describe('ProjectActivityCard', () => {
  it('should render as expected', () => {
    const node = setupNode()
    expect(node.find('.project-activity-card .name').first().text()).to.contain(parentPost.name)
    expect(node.find('.title').first().text()).to.contain(post.name)
  })
})

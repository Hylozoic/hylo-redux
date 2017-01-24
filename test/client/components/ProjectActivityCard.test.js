import '../support'
import { mount } from 'enzyme'
import React from 'react'
import { configureStore } from '../../../src/store'
import ProjectActivityCard from '../../../src/components/ProjectActivityCard'

const state = {
  people: {
    'x': {
      name: 'Mr X',
      id: 'x',
      avatar_url: 'image.png'
    }
  }
}

const post = {
  name: 'The Request Post',
  user_id: 'x',
  project: {
    name: 'The Parent Project'
  }
}

const setupNode = () => {
  const store = configureStore(state).store
  return mount(<ProjectActivityCard post={post} />, {
    context: { store, dispatch: () => {} },
    childContextTypes: {store: React.PropTypes.object, dispatch: React.PropTypes.func}
  })
}

describe('ProjectActivityCard', () => {
  it('should render as expected', () => {
    const node = setupNode()
    expect(node.find('.project-activity-card .name').first().text()).to.contain(post.project.name)
    expect(node.find('.title').first().text()).to.contain(post.name)
  })
})

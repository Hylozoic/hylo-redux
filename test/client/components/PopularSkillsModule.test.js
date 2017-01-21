import '../support'
import { mount } from 'enzyme'
import React from 'react'
import { Provider } from 'react-redux'
import { configureStore } from '../../../src/store'
import PopularSkillsModule from '../../../src/components/PopularSkillsModule'

const community = {
  slug: 'foomunity',
  popularSkills: [
    'hacky-sack',
    'conjuring'
  ]
}

const setupNode = () => {
  const store = configureStore().store
  return mount(<Provider store={store}>
    <PopularSkillsModule community={community} />
  </Provider>)
}

describe('PopularSkillsModule', () => {
  it('should render as expected', () => {
    const node = setupNode()
    expect(node.text()).to.have.string('hacky-sack')
    expect(node.text()).to.have.string('conjuring')
  })
})

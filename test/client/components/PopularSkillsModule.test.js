import '../support'
import { mount } from 'enzyme'
import React from 'react'
import { PopularSkillsModule } from '../../../src/components/PopularSkillsModule'

const community = {
  slug: 'foomunity',
  popularSkills: [
    'hacky-sack',
    'conjuring'
  ]
}

const setupNode = () => {
  return mount(
    <PopularSkillsModule people={[]} community={community} dispatch={() => {}} />
  )
}

describe('PopularSkillsModule', () => {
  it('should render as expected', () => {
    const node = setupNode()
    expect(node.text()).to.have.string('hacky-sack')
    expect(node.text()).to.have.string('conjuring')
  })
})

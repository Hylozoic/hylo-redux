/* eslint-disable camelcase */
import '../../support'
import React from 'react'
import { merge } from 'lodash'
import { shallow } from 'enzyme'
import TagSettings, { TopicRow } from '../../../src/containers/TagSettings/component'

const community = {id: '1', slug: 'foomunity'}

const twoTags = [
  {
    id: '1',
    name: 'tagone',
    memberships: [{
      community_id: community.id,
      description: 'first tag',
      is_default: true
    }]
  },
  {
    id: '2',
    name: 'tagtwo',
    memberships: [{
      community_id: community.id,
      description: 'second tag',
      is_default: false
    }]
  }
]

describe('TagSettings', () => {
  const requiredProps = {
    tags: [],
    community,
    total: 0,
    showModal: () => {},
    fetchTags: () => {},
    removeTagFromCommunity: () => {},
    updateCommunityTag: () => {}
  }

  function renderComponent (props) {
    return shallow(<TagSettings {...merge(requiredProps, props)} />)
  }

  it('will render with minimum required props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('#topic-settings').length).to.equal(1)
  })

  describe('with two tags', () => {
    const props = {
      tags: twoTags,
      total: 2
    }

    it('renders correctly', () => {
      const wrapper = renderComponent(props)
      expect(wrapper.find('TopicRow').length).to.equal(2)
      expect(wrapper.find('TopicRow').at(0).prop('tag').name)
      .to.equal(props.tags[0].name)
      expect(wrapper.find('TopicRow').at(1).prop('tag').name)
      .to.equal(props.tags[1].name)
    })
  })
})

describe('TopicRow', () => {
  const requiredProps = {
    tag: {
      id: '1',
      name: 'tagname',
      description: 'the tag'
    },
    slug: 'slug',
    remove: () => {},
    update: () => {},
    canDelete: () => {}
  }

  function renderComponent (props) {
    return shallow(<TopicRow {...merge(requiredProps, props)} />)
  }

  it('will render topic row with minimum required props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('.name').text())
    .to.equal(requiredProps.tag.name)
    expect(wrapper.find('A').prop('to'))
    .to.equal(`/c/${requiredProps.slug}/tag/${requiredProps.tag.name}`)
    expect(wrapper.find('.description-row').text())
    .to.equal(requiredProps.tag.description)
  })

  it('will render with default box checked', () => {
    const wrapper = renderComponent({tag: {...requiredProps.tag, is_default: true}})
    expect(wrapper.find('input[type="checkbox"]').prop('defaultChecked'))
    .to.equal(true)
  })

  it('calls update with the right params when edited', () => {
    const update = spy()
    const wrapper = renderComponent({update})
    wrapper.find('.edit-link').simulate('click')
    wrapper.find('input[type="text"]').simulate('change', {target: {value: 'new description'}})
    wrapper.find('.check').simulate('click')
    expect(update).to.have.been.called.with(
      requiredProps.tag,
      {description: 'new description'}
    )
  })
})

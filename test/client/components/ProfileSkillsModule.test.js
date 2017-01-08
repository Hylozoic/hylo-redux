import '../support'
import { spyify } from '../../support/helpers'
import { mount } from 'enzyme'
import React, { PropTypes } from 'react'
import { configureStore } from '../../../src/store'
import { keyMap } from '../../../src/util/textInput'
import * as actions from '../../../src/actions'
import ProfileSkillsModule from '../../../src/components/ProfileSkillsModule'

describe('ProfileSkillsModule', () => {
  let node

  beforeEach(() => {
    window.FEATURE_FLAGS = { IN_FEED_PROFILE_COMPLETION_MODULES: 'on' }
    const currentUser = { id: '5', name: 'Honesty Counts', bio: null }
    const store = configureStore().store
    let dispatch = spy()
    node = mount(<ProfileSkillsModule person={currentUser} />, {
      context: { store, dispatch },
      childContextTypes: { store: PropTypes.object, dispatch: PropTypes.func }
    })
  })

  it('renders without errors', () => {
    expect(node.find('.profile-skills').length).to.equal(1)
    expect(node.find('h2').first().text()).to.have.string('Welcome Honesty!')
  })

  it('is invalid without any skills set', () => {
    expect(node.find('button')).to.have.attr('disabled')
  })

  it('is valid with a skill selected (created)', () => {
    enterSkill('eating-food')
    expect(node.find('button')).to.not.have.attr('disabled')
    expect(node.find('.tag-input ul').text()).to.have.string('eating-food')
  })

  it('should save skills', () => {
    enterSkill('eating-food')
    enterSkill('hackysack')
    const saveButton = node.find('button').first()
    spyify(actions, 'updateCurrentUser')
    saveButton.simulate('click')
    expect(actions.updateCurrentUser).to.have.been.called.with({
      tags: ['eating-food', 'hackysack']
    })
  })

  const enterSkill = (value) => {
    node.find('.tag-input input').first().simulate('keyDown', {
      target: {value}, keyCode: keyMap.ENTER
    })
  }
})

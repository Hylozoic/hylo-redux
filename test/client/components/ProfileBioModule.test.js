import '../support'
import { spyify } from '../../support/helpers'
import { mount } from 'enzyme'
import React, { PropTypes } from 'react'
import * as actions from '../../../src/actions'
import ProfileBioModule from '../../../src/components/ProfileBioModule'

describe('ProfileBioModule', () => {
  let node

  before(() => {
    window.FEATURE_FLAGS = { IN_FEED_PROFILE_COMPLETION_MODULES: 'on' }
    const currentUser = {
      id: '5', name: 'Honesty Counts', bio: null
    }
    const dispatch = spy()
    node = mount(<ProfileBioModule person={currentUser} />, {
      context: { dispatch },
      childContextTypes: { dispatch: PropTypes.func }
    })
  })

  it('renders without errors', () => {
    expect(node.find('.profile-bio').length).to.equal(1)
    expect(node.find('h2').first().text()).to.have.string('Welcome Honesty')
  })

  it('is invalid when no bio is entered', () => {
    expect(node.find('button')).to.have.attr('disabled')
  })

  it('is valid when a bio is entered', () => {
    enterBio('test')
    expect(node.find('button')).to.not.have.attr('disabled')
  })

  it('should save bio', () => {
    const bio = 'testing'
    enterBio(bio)
    spyify(actions, 'updateCurrentUser')
    const saveButton = node.find('button').first()
    saveButton.simulate('click')
    expect(actions.updateCurrentUser).to.have.been.called.with({bio})
  })

  const enterBio = (value) => {
    return node.find('textarea').first().simulate('change', {target: {value}})
  }
})

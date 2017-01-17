import '../support'
import { wait, mockActionResponse } from '../../support/helpers'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import React, { PropTypes } from 'react'
import { updateCurrentUser } from '../../../src/actions'
import ProfileBioModule from '../../../src/components/ProfileBioModule'

const currentUser = {
  id: '5',
  name: 'Honesty Counts',
  bio: ''
}

const store = configureStore().store

describe('ProfileBioModule', () => {
  let node

  before(() => {
    window.FEATURE_FLAGS = { IN_FEED_PROFILE_COMPLETION_MODULES: 'on' }
  })

  beforeEach(() => {
    node = mount(
      <ProfileBioModule person={currentUser} />,
      {
        context: { store, dispatch: store.dispatch },
        childContextTypes: {
          store: PropTypes.object,
          dispatch: PropTypes.func
        }
      }
    )
    mockActionResponse(updateCurrentUser(), {})
  })

  const enterBio = (value) => {
    return node.find('textarea').first().simulate(
      'change', {target: {value}}
    )
  }

  it('renders without errors', () => {
    expect(node.find('.profile-bio').length).to.equal(1)
    expect(node.find('h2').first().text()).to.have.string('Welcome Honesty')
  })

  it('is invalid when no bio is entered', () => {
    expect(node.state('valid')).to.be.false
  })

  it('is valid when a bio is entered', () => {
    enterBio('test')
    expect(node.state('valid')).to.be.true
  })

  it('should save bio', () => {
    enterBio('testing')
    const saveButton = node.find('button').first()
    saveButton.simulate('click')
    return wait(300, () => {
      const storedBio = store.getState().people.current.bio
      expect(storedBio).to.equal('testing')
    })
  })
})

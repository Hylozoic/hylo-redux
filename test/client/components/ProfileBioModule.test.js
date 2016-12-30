import support from '../support'
import { mocks } from '../../support'
import { mockActionResponse } from '../../support/helpers'
import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import ProfileBioModule from '../../../src/components/ProfileBioModule'
import { getKeyCode, keyMap } from '../../../src/util/textInput'
import { wait } from '../../support/helpers'
import { updateUserSettings } from '../../../src/actions'

const currentUser = {
  id: '5',
  name: 'Honesty Counts',
  bio: ''
}

const store = configureStore().store

describe('ProfileBioModule', () => {
  let node

  beforeEach(() => {
    // store.dispatch = spy(store.dispatch)
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
    mockActionResponse(updateUserSettings(), {})
  })

  const enterBio = (value) => {
    return node.find('textarea').first().simulate(
      'change', {target: {value}}
    )
  }

  it('renders without errors', () => {
    expect(node.find('.profile-bio').length).to.equal(1)
    expect(node.state('firstName')).to.equal('Honesty')
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
    return wait(600, () => {
      const storedBio = store.getState().people.current.bio
      expect(storedBio).to.equal('testing')
    })
  })
})

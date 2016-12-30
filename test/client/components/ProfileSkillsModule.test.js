require('../support')
import React, { PropTypes } from 'react'
import { Provider } from 'react-redux'
import { shallow, mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import ProfileSkillsModule from '../../../src/components/ProfileSkillsModule'
import { getKeyCode, keyMap } from '../../../src/util/textInput'
import { wait } from '../../support/helpers'

const currentUser = {
  id: '5',
  name: 'Honesty Counts'
}

describe('ProfileSkillsModule', () => {
  let node

  beforeEach(() => {
    const store = configureStore({typeaheadMatches: { tags: [] }}).store
    const dispatch = () => {}
    const options = {
      context: { store, dispatch },
      childContextTypes: {
        store: PropTypes.object.isRequired,
        dispatch: PropTypes.func.isRequired
      }
    }

    const props = { person: currentUser }

    node = mount(<ProfileSkillsModule {...props} />, options)
    // node = shallow(<ProfileSkillsModule person={currentUser} />)

    window.FEATURE_FLAGS = {
      REQUEST_TO_JOIN_COMMUNITY: 'on',
      COMMUNITY_SETUP_CHECKLIST: 'on'
    }
  })

  it('renders without errors', () => {
    expect(node.state('firstName')).to.equal('Honesty')
    expect(node.find('.profile-skills').length).to.equal(1)
    expect(node.find('h2').first().text()).to.have.string('Welcome Honesty!')
  })

  it('it is invalid without any skill tags set', () => {
    expect(node.state('valid')).to.be.false
  })

  it('it is valid with any skill tag set', () => {
    const tagInput = node.find('.tag-input input').first()
    const saveButton = node.find('button').first()

    tagInput.simulate('change', {target: {value: 'eating-food'}})
    // tagInput.simulate('keyDown', {key: 'Enter', keyCode: keyMap.ENTER, which: keyMap.ENTER})

    console.log(tagInput.props().value)

    // tagInput.simulate('change', {target: {value: 'B'}})
    // tagInput.simulate('keyDown', {key: 'B', keyCode: 66, which: 66})

    // expect(node.find('.tag-input ul').text()).to.have.string('eating-food')
    // saveButton.simulate('click')
  })
})

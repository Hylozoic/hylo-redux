require('../support')
import { mount } from 'enzyme'
import React from 'react'
import { configureStore } from '../../../src/store'
import ChangeImageButton from '../../../src/components/ChangeImageButton'
import { UPLOAD_IMAGE } from '../../../src/actions'

describe('ChangeImageButton', () => {
  const person = {id: 1, avatar_url: 'http://foo.com/bar (1).png'}

  it('renders correctly', () => {
    const store = configureStore({}).store
    const node = mount(<ChangeImageButton person={person} type='avatar_url' />, {
      context: { dispatch: () => {}, store },
      childContextTypes: {dispatch: React.PropTypes.func}
    })
    expect(node.find('.icon-Camera').length).to.equal(1)
  })

  it('renders correctly when loading', () => {
    const store = configureStore({
      pending: {
        [UPLOAD_IMAGE]: {
          subject: 'user-avatar',
          id: person.id
        }
      }
    }).store
    const node = mount(<ChangeImageButton person={person} type='avatar_url' />, {
      context: { dispatch: () => {}, store },
      childContextTypes: {dispatch: React.PropTypes.func}
    })
    expect(node.find('.icon-Clock').length).to.equal(1)
  })
})

require('../support')
import React from 'react'
import { mocks } from '../../support'
import ProjectEditor from '../../../src/containers/project/ProjectEditor'
import { Provider } from 'react-redux'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'

let state = {
  pending: {},
  people: {
    current: {
      memberships: [{community: {id: 'c', name: 'Here'}}]
    }
  },
  projectEdits: {},
  projects: {
    foo: {
      title: 'Project Foo',
      media: [
        {type: 'video', url: 'http://youtube.com/foo'}
      ]
    }
  }
}

let store = mocks.redux.store(state)

describe('ProjectEditor', () => {
  it('displays project video url', () => {
    let component = <Provider store={store}>
      <ProjectEditor params={{id: 'foo'}}/>
    </Provider>

    let node = renderIntoDocument(component)
    let video = findRenderedDOMComponentWithClass(node, 'form-control video')
    expect(video.value).to.equal('http://youtube.com/foo')
  })
})

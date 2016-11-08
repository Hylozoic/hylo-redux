require('../support')
import { mount } from 'enzyme'
import React from 'react'
import ThreadsDropdown from '../../../src/containers/ThreadsDropdown'
import { configureStore } from '../../../src/store'

const community = {
  id: '1',
  slug: 'foomunity',
  name: 'Foom Unity',
  beta_access_code: 'foom',
  description: 'Social cohesion in the face of AI hard takeoff'
}

const currentUser = {
  id: '5'
}

const state = {
  communities: {[community.slug]: community},

  people: {
    '1': {
      id: '1',
      name: 'Joe'
    },
    '2': {
      id: '2',
      name: 'sue'
    },
    '5': currentUser
  },

  postsByQuery: {
    threads: ['1', '2']
  },

  posts: {
    '1': {
      id: '1',
      follower_ids: ['1', '5']
    },
    '2': {
      id: '2',
      follower_ids: ['2', '5']
    }
  },

  comments: {
    '11': {
      text: 'Hey there!',
      user_id: '1'
    },

    '21': {
      text: 'Hey there again!',
      user_id: '2'
    },

    '22': {
      text: 'right back atcha!',
      user_id: '5'
    }
  },
  commentsByPost: {
    '1': ['11'],
    '2': ['21', '22']
  }

}

describe('ThreadsDropdown', () => {
  var store

  beforeEach(() => {
    store = configureStore(state).store
  })

  it('renders without errors', () => {
    const node = mount(<ThreadsDropdown newCount={5}/>, {
      context: {store, currentUser, dispatch: store.dispatch},
      childContextTypes: {currentUser: React.PropTypes.object, dispatch: React.PropTypes.func}
    })

    expect(node.find('.badge').text()).to.equal('5')

    node.find('.dropdown-menu').first().simulate('click')

    const threads = node.find('.unread')
    expect(threads.length).to.equal(2)

    expect(threads.at(0).text()).to.equal('sue You: right back atcha!')

    expect(threads.at(1).text()).to.equal('Joe Hey there!')
  })
})

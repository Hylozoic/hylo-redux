require('../support')
import { mount } from 'enzyme'
import React from 'react'
import CommentForm from '../../../src/components/CommentForm'
import { CREATE_COMMENT } from '../../../src/constants'
import { configureStore } from '../../../src/store'
const { object, func } = React.PropTypes

describe('CommentForm', () => {
  let community = {id: '1', name: 'Foomunity', slug: 'foo'}

  let currentUser = {
    id: 'x',
    name: 'Mr. X',
    avatar_url: '/img/mrx.png'
  }

  let state = {
    communities: {
      [community.slug]: community
    },
    people: {
      current: currentUser
    },
    posts: {
      '1': {
        id: '1', name: 'post', type: 'offer',
        user_id: 'x',
        communities: [community.id],
        description: '<p>.</p>'
      }
    },
    commentEdits: {
      new: {
        '1': 'comment text'
      }
    }
  }

  it('posts updated tagDescriptions when saveWithTagDescriptions is called', () => {
    var createCommentParams
    const store = configureStore(state).store
    store.oldDispatch = store.dispatch
    store.dispatch = function (action) {
      if (action.type === CREATE_COMMENT) {
        createCommentParams = action.payload.params
      }
      return this.oldDispatch(action)
    }.bind(store)
    const node = mount(<CommentForm postId={'1'}/>, {
      context: {store, dispatch: store.dispatch, currentUser: state.people.current},
      childContextTypes: {store: object, currentUser: object, dispatch: func}
    })
    const wrappedInstance = node.instance().getWrappedInstance()
    wrappedInstance.refs.editor.getContent = () => 'some generic comment'
    wrappedInstance.setState({enabled: true})
    wrappedInstance.saveWithTagDescriptions({
      thenewtag: {description: 'something', is_default: false}
    })
    expect(createCommentParams).to.deep.equal({
      text: 'some generic comment',
      tagDescriptions: {
        thenewtag: {description: 'something', is_default: false}
      }
    })
  })
})

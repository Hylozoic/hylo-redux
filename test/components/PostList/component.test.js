import React from 'react'
import { shallow } from 'enzyme'
import { merge, sample, times } from 'lodash'
import { mocks } from '../../support'
import PostList from '../../../src/components/PostList/component'

const { user } = mocks.models

const user1 = user()

const user2 = user()

const posts = [
  {
    id: 1,
    type: 'project',
    name: 'i am a project',
    followers: times(3, () => user()),
    user_id: user1.id,
    community_ids: [1]
  },
  {
    id: 2,
    type: 'event',
    name: 'come to my show',
    followers: times(8, () => user()),
    responders: times(7, () => user({response: sample(['yes', 'no'])})),
    user_id: user2.id,
    community_ids: [2]
  },
  {
    id: 3,
    name: 'i am just a normal post',
    description: 'minding my own business',
    followers: [],
    user_id: user1.id,
    community_ids: [2]
  },
  {
    id: -1,
    type: 'module',
    component: <div className='my-module'>my module</div>
  }
]

const minProps = {
  posts,
  navigate: () => {},
  showExpandedPost: () => {}
}

function renderComponent (props) {
  return shallow(<PostList {...merge(minProps, props)} />)
}

describe('<PostList />', () => {
  it('renders as expected with minimum props', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('ShowPost').length).to.equal(4)
  })

  it('should render correct children for types of posts', () => {
    const wrapper = renderComponent()
    expect(wrapper.find('ShowPost').length).to.equal(4)
    expect(
      wrapper.find('ShowPost').map((postWrapper) => postWrapper.dive().name())
    ).to.deep.equal([
      'Connect(ProjectPostCard)',
      'Connect(EventPostCard)',
      'Connect(Post)',
      'div'
    ])
  })
})

// // TODO: use below for connector test
// //
// const parentPost = {
//   id: 'parentPost',
//   type: 'project',
//   name: 'i am a project',
//   followers: times(3, () => user()),
//   user_id: user1.id,
//   community_ids: [1, 2]
// }
//
// // eslint-disable-next-line
// const state = {
//   communities: {
//     foo: {
//       id: 1,
//       name: 'foo'
//     },
//     bar: {
//       id: 2,
//       name: 'bar'
//     }
//   },
//   posts: {
//     [parentPost.id]: parentPost
//   },
//   people: {
//     [user1.id]: user1,
//     [user2.id]: user2
//   },
//   typeaheadMatches: {
//     invite: [
//       {id: 'x', name: 'author of post fixture'},
//       {id: 'y', name: 'a contributing user'}
//     ]
//   }
// }

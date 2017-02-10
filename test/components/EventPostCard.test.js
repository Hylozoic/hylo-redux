// import { mocks } from '../support'
// import { sample, times } from 'lodash'
// import React from 'react'
// import { shallow } from 'enzyme'
// import EventPostCard from '../../src/components/EventPostCard/component'
//
// const { user } = mocks.models
//
// const user1 = user()
// const user2 = user()
//
// const parentPost = {
//   id: 'parentPost',
//   type: 'project',
//   name: 'i am a project',
//   followers: times(3, () => user()),
//   user_id: user1.id,
//   community_ids: [1, 2]
// }
//
// const posts = [
//   {
//     id: 1,
//     type: 'project',
//     name: 'i am a project',
//     followers: times(3, () => user()),
//     user_id: user1.id,
//     community_ids: [1]
//   },
//   {
//     id: 2,
//     type: 'event',
//     name: 'come to my show',
//     followers: times(8, () => user()),
//     responders: times(7, () => user({response: sample(['yes', 'no'])})),
//     user_id: user2.id,
//     community_ids: [2]
//   },
//   {
//     id: 3,
//     name: 'i am just a normal post',
//     description: 'minding my own business',
//     followers: [],
//     user_id: user1.id,
//     community_ids: [2]
//   },
//   {
//     id: -1,
//     type: 'module',
//     component: <div className='my-module'>my module</div>
//   }
// ]
//
// describe('<EventPostCard />', () => {
//   it('renders', () => {
//     const wrapper = shallow(<EventPostCard post={posts[0]} />)
//   })
// })

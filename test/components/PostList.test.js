import { mocks, helpers } from '../support'
import { sample, times } from 'lodash'
import { renderToString } from 'react-dom/server'
import PostList from '../../src/components/PostList'
import cheerio from 'cheerio'
const { createElement } = helpers
const { user } = mocks.models

const user1 = user()
const user2 = user()

const store = mocks.redux.store({
  communities: {
    foo: {
      id: 1,
      name: 'foo'
    },
    bar: {
      id: 2,
      name: 'bar'
    }
  },
  people: {
    [user1.id]: user1,
    [user2.id]: user2
  }
})

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
  }
]

describe('PostList', () => {
  it('renders a mixed group of posts', () => {
    const component = createElement(PostList, {posts}, {store})
    const doc = cheerio.load(renderToString(component))
    expect(doc('.post').length).to.equal(3)
    expect(doc('.project-summary').length).to.equal(1)
    expect(doc('.event-summary').length).to.equal(1)
  })
})

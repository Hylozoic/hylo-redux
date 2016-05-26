import { mocks } from '../support'
import React from 'react'
import { renderToString } from 'react-dom/server'
import { Provider } from 'react-redux'
import Notifications from '../../src/containers/Notifications'

const cat = {
  id: 1,
  name: 'Cat',
  avatar_url: '/img/cat.png'
}

const store = mocks.redux.store({
  currentCommunityId: 'all',
  communities: {},
  people: {current: {}},
  activitiesByCommunity: {all: [1, 2, 3]},
  totalActivities: {all: 80},
  pending: {},
  activities: {
    1: {
      id: 1,
      action: 'comment',
      actor: cat,
      post: {
        id: 5,
        name: 'Foo',
        communities: [{slug: 'foocom'}]
      },
      comment: {
        id: 1,
        text: 'Yes, foo!'
      },
      meta: {
        reasons: ['newComment']
      }
    },
    2: {
      id: 2,
      action: 'tag',
      actor: cat,
      post: {
        id: 6,
        name: 'Bar',
        communities: [{slug: 'foocom'}]
      },
      meta: {
        reasons: ['tag: bar']
      }
    },
    3: {
      id: 3,
      action: 'mention',
      actor: cat,
      post: {
        id: 7,
        name: 'Baz',
        communities: [{slug: 'barcom'}]
      },
      meta: {
        reasons: ['mention']
      }
    }
  }
})

describe('Notifications', () => {
  it('works', () => {
    renderToString(<Provider store={store}>
      <Notifications/>
    </Provider>)
  })
})

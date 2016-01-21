import support from '../support'
import React from 'react'
import { renderToString } from 'react-dom/server'
import UserSettings from '../../src/containers/user/UserSettings'
import Cheerio from 'cheerio'

describe('UserSettings', () => {
  it('opens the Account section when expand=password is set', () => {
    let store = support.mocks.redux.store({
      people: {
        current: {
          id: 'a',
          name: 'test person',
          email: 'foo@bar.com',
          settings: {}
        }
      }
    })

    let location = {
      query: {
        expand: 'password'
      }
    }

    let html = renderToString(<UserSettings {...{store, location}}/>)
    let $ = Cheerio.load(html)
    expect($('.section.email .half-column:first-child p').text()).to.equal('foo@bar.com')
  })
})

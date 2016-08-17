require('../support')
import React from 'react'
import makeRoutes from '../../src/routes'
import { configureStore } from '../../src/store'
import { renderToString } from 'react-dom/server'
import { match, RouterContext } from 'react-router'
import { Provider } from 'react-redux'
import { promisify } from 'bluebird'

const matchPromise = promisify(match, {multiArgs: true})

describe('server-side rendering without prefetching', () => {
  it('renders the login page', () => {
    const store = configureStore({}).store
    const routes = makeRoutes(store)

    return matchPromise({routes, location: '/login'})
    .then(([redirectLocation, renderProps]) => {
      let html = renderToString(<Provider store={store}>
        <RouterContext location='history' {...renderProps}/>
      </Provider>)

      expect(html).to.contain('Log in')
    })
  })
})

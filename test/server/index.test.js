require('../index')
import React from 'react'
import makeRoutes from '../../src/routes'
import { configureStore } from '../../src/store'
import { renderToString } from 'react-dom/server'
import { match, RoutingContext } from 'react-router'
import { Provider } from 'react-redux'
import { promisify } from 'bluebird'

const matchPromise = promisify(match, {multiArgs: true})

describe('server-side rendering without prefetching', () => {
  it('renders the logged-out home page', () => {
    const store = configureStore({})
    const routes = makeRoutes(store)

    return matchPromise({routes, location: '/'})
    .then(([redirectLocation, renderProps]) => {
      let html = renderToString(<Provider store={store}>
        <RoutingContext location='history' {...renderProps}/>
      </Provider>)

      expect(html).to.contain('Home!')
      expect(html).to.contain('Log in')
    })
  })
})

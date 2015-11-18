import express from 'express'
import React from 'react'
import { renderToString, renderToStaticMarkup } from 'react-dom/server'
import Html from '../containers/Html'
import config from '../../config'
import routes from '../routes'
import { match, RoutingContext } from 'react-router'
import { configureStore } from '../store'
import { Provider } from 'react-redux'
import createHistory from 'history/lib/createMemoryHistory'
import { syncReduxAndRouter } from 'redux-simple-router'
import { green } from 'chalk'
import { post, del } from 'request'

const server = express()
server.use(express.static('public'))
server.use(express.static('dist'))

server.post('/login', function (req, res) {
  req.pipe(post(config.upstreamHost + '/noo/login?resp=user')).pipe(res)
})

server.delete('/logout', function (req, res) {
  req.pipe(del(config.upstreamHost + '/noo/session')).pipe(res)
})

server.use((req, res) => {
  console.log(green(req.originalUrl))

  const initialState = {count: 0}
  const store = configureStore(initialState)
  const history = createHistory()
  syncReduxAndRouter(history, store)

  match({routes, location: req.originalUrl}, (error, redirectLocation, renderProps) => {
    if (error) {
      res.status(500).send(error.message)
    } else if (redirectLocation) {
      res.redirect(302, redirectLocation.pathname + redirectLocation.search)
    } else if (renderProps) {
      // FIXME state.routing is not up to date at this point

      const markup = renderToString(
        <Provider store={store}>
          <RoutingContext location='history' {...renderProps}/>
        </Provider>
      )

      var page = React.createElement(Html, {
        markup: markup,
        cssBundle: config.cssBundle,
        jsBundle: config.jsBundle
      })

      res.status(200).send(renderToStaticMarkup(page))
    } else {
      res.status(404).send('Not found')
    }
  })
})

server.listen(config.port, function (err) {
  if (err) throw err
  console.log('listening on port ' + config.port)
})

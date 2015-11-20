import express from 'express'
import config from '../../config'
import { magenta } from 'chalk'
import request from 'request'
import appHandler from './appHandler'

const server = express()
server.use(express.static('public'))
server.use(express.static('dist'))

server.post('/login', function (req, res) {
  req.pipe(request.post(config.upstreamHost + '/noo/login?resp=user')).pipe(res)
})

server.delete('/logout', function (req, res) {
  req.pipe(request.del(config.upstreamHost + '/noo/session')).pipe(res)
})

// api proxy
server.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/noo')) return next()

  let upstreamUrl = config.upstreamHost + req.originalUrl
  console.log('\n' + magenta(`${req.method} ${upstreamUrl}`))

  let headers = req.headers
  let method = request[req.method.toLowerCase()]
  let upstreamReq = method(upstreamUrl, {headers})

  req.pipe(upstreamReq).pipe(res)
})

server.use(appHandler)

server.listen(config.port, function (err) {
  if (err) throw err
  console.log('listening on port ' + config.port)
})

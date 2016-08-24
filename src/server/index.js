import appHandler from './appHandler' // this line must be first
import { upstreamHost } from '../config'
import { magenta, red } from 'chalk'
import { info } from '../util/logging'
import { setupAssetManifest } from '../util/assets'
import { parse } from 'url'
import { handleStaticPages } from './proxy'
import express from 'express'
import request from 'request'

const port = process.env.PORT || 9000
const upstreamHostname = parse(upstreamHost).hostname
const fixHeaders = headers => ({...headers, host: upstreamHostname})

const server = express()
server.use(express.static('public'))
handleStaticPages(server)

server.post('/login', function (req, res) {
  let headers = fixHeaders(req.headers)
  let url = `${upstreamHost}/noo/login?resp=user`
  req.pipe(request.post(url, {headers})).pipe(res)
})

server.post('/logout', function (req, res) {
  let headers = fixHeaders(req.headers)
  let url = `${upstreamHost}/noo/session`
  req.pipe(request.del(url, {headers})).pipe(res)
})

const notFound = (req, res) => res.status(404).end()
server.get('/favicon.ico', notFound)
server.get('/robots.txt', notFound)

// api proxy
server.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/noo')) return next()

  let url = upstreamHost + req.originalUrl
  info(magenta(`${req.method} ${url}`))

  request.delete = request.delete || request.del
  let method = request[req.method.toLowerCase()]
  let headers = fixHeaders(req.headers)
  let upstreamReq = method(url, {headers, followRedirect: false})

  req.pipe(upstreamReq)
  .on('error', err => console.error(magenta('✗ ') + red(err.message)))
  .pipe(res)
})

server.use(appHandler)

setupAssetManifest(() => server.listen(port, err => {
  if (err) throw err
  info('listening on port ' + port)
}))

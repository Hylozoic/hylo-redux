import appHandler from './appHandler' // this line must be first
import redirectToApp from './redirectToApp'
import { upstreamHost } from '../config'
import { magenta, red } from 'chalk'
import { info } from '../util/logging'
import { qualifiedUrl, setManifest } from '../util/assets'
import { parse } from 'url'
import { handleStaticPages, preloadCache } from './proxy'
import express from 'express'
import request from 'request'
import { readFileSync } from 'fs'
import compression from 'compression'
import cookieParser from 'cookie-parser'

const port = process.env.PORT || 9000
const upstreamHostname = parse(upstreamHost).hostname
const fixHeaders = headers => ({...headers, host: upstreamHostname})

const server = express()
server.use(cookieParser())
server.use(compression())
server.use(express.static('public'))
server.use(redirectToApp)
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

const setupAssetManifest = callback => {
  if (!process.env.USE_ASSET_MANIFEST) return callback()

  if (process.env.NODE_ENV !== 'production') {
    info('using local asset manifest: dist/manifest.json')
    setManifest(JSON.parse(readFileSync(__dirname + '/../../dist/manifest.json')))
    return callback()
  }

  const url = qualifiedUrl(`manifest-${process.env.SOURCE_VERSION}.json`)
  info(`using asset manifest: ${url}`)
  request.get(url, {json: true}, (err, res) => {
    if (err) throw err
    if (res.statusCode !== 200) throw new Error(`${url} => ${res.statusCode}`)
    setManifest(res.body)
    callback()
  })
}

setupAssetManifest(() => server.listen(port, err => {
  if (err) throw err
  info('listening on port ' + port)
}))

if (process.env.PRELOAD_PROXY_CACHE) {
  preloadCache()
}

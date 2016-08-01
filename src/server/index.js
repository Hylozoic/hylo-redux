// appHandler loads New Relic so it should be imported first
import appHandler from './appHandler'
import { upstreamHost, useAssetManifest, assetHost, assetPath } from '../config'
import { magenta, red } from 'chalk'
import { info } from '../util/logging'
import { setManifest } from '../util/assets'
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

const start = () => {
  server.listen(port, function (err) {
    if (err) throw err
    info('listening on port ' + port)
  })
}

if (useAssetManifest) {
  let url = `${assetHost}/${assetPath}/manifest-${process.env.SOURCE_VERSION}.json`
  info(`using manifest: ${url}`)
  request.get(url, {json: true}, (err, res) => {
    if (err) throw err
    if (res.statusCode !== 200) throw new Error(`${url} => ${res.statusCode}`)

    setManifest(res.body)
    start()
  })
} else {
  start()
}

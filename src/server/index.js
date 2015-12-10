import express from 'express'
import config from '../../config'
import { magenta, red } from 'chalk'
import request from 'request'
import appHandler from './appHandler'
import { info } from '../util/logging'
import { setManifest } from '../util/assets'

const server = express()
server.use(express.static('public'))
server.use(express.static('dist'))

server.post('/login', function (req, res) {
  req.pipe(request.post(config.upstreamHost + '/noo/login?resp=user')).pipe(res)
})

server.post('/logout', function (req, res) {
  req.pipe(request.del(config.upstreamHost + '/noo/session')).pipe(res)
})

// api proxy
server.use((req, res, next) => {
  if (!req.originalUrl.startsWith('/noo')) return next()

  let upstreamUrl = config.upstreamHost + req.originalUrl
  info(magenta(`${req.method} ${upstreamUrl}`))

  let headers = req.headers
  let method = request[req.method.toLowerCase()]
  let upstreamReq = method(upstreamUrl, {headers, followRedirect: false})

  req.pipe(upstreamReq)
  .on('error', err => console.error(magenta('✗ ') + red(err.message)))
  .pipe(res)
})

server.use(appHandler)

const start = () => {
  server.listen(config.port, function (err) {
    if (err) throw err
    info('listening on port ' + config.port)
  })
}

if (config.useAssetManifest) {
  let url = `${config.assetHost}/manifest-${config.sourceVersion}.json`
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

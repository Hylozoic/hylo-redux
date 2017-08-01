const LRU = require('lru-cache')
const mime = require('mime')
const request = require('request')
const streamifier = require('streamifier')
const cache = LRU(50)
import { gzip } from 'zlib'
import { setTransactionName } from './newrelic'
import path from 'path'

const staticPages = [
  '',
  '/help',
  '/help/markdown',
  '/about',
  '/about/careers',
  '/about/contact',
  '/about/team',
  '/subscribe',
  '/styleguide',
  '/team',
  '/terms',
  '/terms/privacy',
  '/newapp'
]

const transformPathname = pathname => {
  // remove trailing slash
  pathname = pathname.replace(/\/$/, '')

  // a path without an extension should be served by index.html in
  // the folder of the same name.
  if (!pathname.match(/\.\w{2,4}$/)) {
    pathname += '/index.html'
  }

  pathname = path.join(process.env.PROXY_PATH_PREFIX, pathname)
  return process.env.PROXY_HOST.replace(/\/$/, '') + pathname
}

const getAndStore = url => {
  const chunks = []
  return new Promise((resolve, reject) => {
    request.get(url)
    .on('error', reject)
    .on('response', upstreamRes => {
      const gzipped = upstreamRes.headers['content-encoding'] === 'gzip'
      upstreamRes.on('data', d => chunks.push(d))
      upstreamRes.on('end', () => {
        const doc = Buffer.concat(chunks)
        const save = value => cache.set(url, value) && resolve(value)
        if (gzipped) {
          save(doc)
        } else {
          gzip(doc, (err, buf) => err ? reject(err) : save(buf))
        }
      })
    })
  })
}

const handlePage = (req, res) => {
  if (process.env.DISABLE_PROXY) {
    return res.status(503).send('Service Unavailable')
  }

  const pathname = require('url').parse(req.url).pathname
  setTransactionName(pathname)
  const newUrl = transformPathname(pathname)
  const cachedValue = cache.get(newUrl)

  console.log(`${pathname} -> ${newUrl} ${cachedValue ? '☺' : '↑'}`)

  const sendCachedData = data => {
    var mimeType = mime.lookup(newUrl)
    res.set('Content-Type', mimeType)
    res.set('Content-Encoding', 'gzip')
    streamifier.createReadStream(data).pipe(res)
  }

  if (cachedValue) {
    sendCachedData(cachedValue)
  } else {
    getAndStore(newUrl)
    .then(() => sendCachedData(cache.get(newUrl)))
    .catch(err => res.serverError(err.message))
  }
}

export const handleStaticPages = server => {
  staticPages.forEach(page => {
    if (page === '') page = '/'
    server.get(page, handlePage)
  })

  server.use((req, res, next) => {
    if (!req.originalUrl.startsWith('/static-assets')) return next()
    return handlePage(req, res)
  })
}

export const preloadCache = () => {
  console.log('preloading proxy cache')
  staticPages.forEach(page => {
    if (page === '') page = '/'
    const url = transformPathname(page)
    getAndStore(url)
  })
}

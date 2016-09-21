const LRU = require('lru-cache')
const mime = require('mime')
const request = require('request')
const streamifier = require('streamifier')
const cache = LRU(50)
import { setTransactionName } from './newrelic'

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

  // add the deploy-specific (cache-busting) path prefix
  if (!pathname.startsWith('/assets')) {
    pathname = `/assets/${process.env.BUNDLE_VERSION}${pathname}`
  }

  return process.env.PROXY_HOST.replace(/\/$/, '') + pathname
}

const getAndStore = url => {
  const chunks = []
  return request.get(url, {gzip: true})
  .on('response', upstreamRes => {
    upstreamRes.on('data', d => chunks.push(d))
    upstreamRes.on('end', () => cache.set(url, Buffer.concat(chunks)))
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
  if (cachedValue) {
    var mimeType = mime.lookup(newUrl)
    res.set('Content-Type', mimeType)
    res.set('Content-Encoding', 'gzip')
    streamifier.createReadStream(cachedValue).pipe(res)
  } else {
    getAndStore(newUrl)
    .on('error', err => res.serverError(err.message))
    .pipe(res)
  }
}

export const handleStaticPages = server => {
  staticPages.forEach(page => {
    if (page === '') page = '/'
    server.get(page, handlePage)
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

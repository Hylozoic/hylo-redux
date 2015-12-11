const AWS = require('aws-sdk')
const fs = require('fs')
const mime = require('mime')
import { promisify } from 'bluebird'
import { walk } from 'walk'
import { commitTag } from './util'

var bucket

const readFile = promisify(fs.readFile)

const upload = (path, destPath, put) => {
  return readFile(path)
  .then(body => put({
    Key: destPath,
    Body: body,
    ContentType: mime.lookup(path),
    Bucket: bucket,
    ACL: 'public-read'
  }))
}

export default function () {
  // deferring assignment because env vars are not yet assigned
  // when the file is first loaded
  bucket = process.env.AWS_S3_BUCKET

  var s3 = new AWS.S3()
  let head = promisify(s3.headObject, {context: s3})
  let put = promisify(s3.putObject, {context: s3})

  let walker = walk('dist')

  return new Promise((resolve, reject) => {
    walker.on('file', (root, stats, next) => {
      let path = `${root}/${stats.name}`
      let destPath = path.replace(/^dist/, process.env.ASSET_PATH)

      // tag the manifest with the current commit
      if (path.match(/manifest\.json/)) {
        destPath = destPath.replace(/\.json$/, `-${commitTag()}.json`)
      }

      head({Bucket: bucket, Key: destPath})
      .then(() => {
        // do nothing if file exists
        console.log(`exists: ${destPath}`)
        next()
      })
      .catch(err => {
        if (!err.code || err.code !== 'NotFound') throw err
        console.log(`uploading: ${destPath}`)
        upload(path, destPath, put).then(next)
      })
    })

    walker.on('errors', reject)
    walker.on('end', resolve)
  })
}

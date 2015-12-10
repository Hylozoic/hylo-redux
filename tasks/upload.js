const AWS = require('aws-sdk')
const fs = require('fs')
const Promise = require('bluebird')
const mime = require('mime')
import config from '../config'

module.exports = function () {
  var s3 = new AWS.S3()
  var put = Promise.promisify(s3.putObject, {context: s3})

  return Promise.map(fs.readdirSync('dist'), function (filename) {
    return put({
      Key: 'misc/lively/' + filename,
      Body: fs.readFileSync('dist/' + filename),
      ContentType: mime.lookup(filename),
      Bucket: config.s3.bucket,
      ACL: 'public-read'
    })
  })
}

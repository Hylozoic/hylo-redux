const AWS = require('aws-sdk')
const fs = require('fs')
const Promise = require('bluebird')
const mime = require('mime')

module.exports = function () {
  var s3 = new AWS.S3()
  var put = Promise.promisify(s3.putObject, s3)

  return Promise.map(fs.readdirSync('dist'), function (filename) {
    return put({
      Key: 'misc/lively/' + filename,
      Body: fs.readFileSync('dist/' + filename),
      ContentType: mime.lookup(filename),
      Bucket: process.env.AWS_S3_BUCKET,
      ACL: 'public-read'
    })
  })
}

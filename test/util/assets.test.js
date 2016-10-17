require('../support')
require('../../gulpfile.babel')
import gulp from 'gulp'
import { readdirSync, readFileSync } from 'fs'
import { removeSync } from 'remove'
import { find } from 'lodash/fp'
import { assetUrl, setManifest } from '../../src/util/assets'

describe('assetUrl', () => {
  var manifest, cssAssetFilename, prefix

  before(function (done) {
    this.timeout(10000)
    process.env.DIST_PATH = 'dist-test'

    const { ASSET_HOST, ASSET_PATH } = process.env
    prefix = `${ASSET_HOST}/${ASSET_PATH}`

    gulp.task('test-task', ['build-dist-css'], function () {
      manifest = JSON.parse(readFileSync('dist-test/manifest.json').toString())
      cssAssetFilename = find(f => f.match(/^index-.*css$/), readdirSync('dist-test'))
      setManifest(manifest)
      done()
    })
    gulp.start(['test-task'])
  })

  after(() => {
    removeSync('dist-test')
  })

  it('returns the correct value for an image', () => {
    const filename = 'img/earth_1920x1080-2f499900d1.jpg'
    expect(manifest['img/earth_1920x1080.jpg']).to.equal(filename)
    expect(assetUrl('img/earth_1920x1080.jpg')).to.equal(`${prefix}/${filename}`)
  })

  it('returns the correct value for index.css', () => {
    expect(manifest['index.css']).to.equal(cssAssetFilename)
    expect(assetUrl('index.css')).to.equal(`${prefix}/${cssAssetFilename}`)
  })
})

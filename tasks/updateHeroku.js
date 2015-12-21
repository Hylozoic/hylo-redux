import { commitTag, herokuConfig } from './util'

export default function (done) {
  let tag = commitTag()
  console.log('setting SOURCE_VERSION to', tag)
  herokuConfig().update({
    SOURCE_VERSION: tag
  }, () => done())
}

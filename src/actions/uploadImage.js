import { upload } from '../client/filepicker'
import { UPLOAD_IMAGE } from './index'

export function uploadImage (opts) {
  let { context, path, convert } = opts
  let payload = new Promise((resolve, reject) => {
    upload({path, convert, success: resolve, failure: reject})
  })

  return {type: UPLOAD_IMAGE, payload, meta: {context}}
}

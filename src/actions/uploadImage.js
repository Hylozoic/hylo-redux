import { upload } from '../client/filepicker'

export const UPLOAD_IMAGE = 'UPLOAD_IMAGE'

export function uploadImage (opts) {
  let { context, path, convert } = opts
  let payload = new Promise((resolve, reject) => {
    upload({path, convert, success: resolve, failure: reject})
  })

  return {type: UPLOAD_IMAGE, payload, meta: {context}}
}

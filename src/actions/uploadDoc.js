import { init } from '../client/GooglePicker'

export const UPLOAD_DOC = 'UPLOAD_DOC'

export function uploadDoc (context) {
  let payload = new Promise((resolve, reject) => {
    init({onPick: resolve})
    .then(picker => picker.setVisible(true))
  })

  return {type: UPLOAD_DOC, payload, meta: {context}}
}

import { init } from '../client/GooglePicker'

export const UPLOAD_DOC = 'UPLOAD_DOC'

const normalize = ({ url, name, iconUrl }) =>
  ({url, name, thumbnail_url: iconUrl, type: 'gdoc'})

export function uploadDoc (context) {
  let payload = new Promise((resolve, reject) => {
    init({onPick: doc => resolve(normalize(doc))})
    .then(picker => picker.setVisible(true))
  })

  return {type: UPLOAD_DOC, payload, meta: {context}}
}

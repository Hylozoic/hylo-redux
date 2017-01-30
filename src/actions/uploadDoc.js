import { init } from '../client/GooglePicker'
import {
  UPLOAD_DOC
} from '../constants'

const normalize = ({ url, name, iconUrl }) =>
  ({url, name, thumbnail_url: iconUrl, type: 'gdoc'})

export function uploadDoc (id) {
  let payload = new Promise((resolve, reject) => {
    init({onPick: doc => resolve(normalize(doc))})
    .then(picker => picker.setVisible(true))
  })

  return {type: UPLOAD_DOC, payload, meta: {id}}
}

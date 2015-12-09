import { CREATE_PROJECT, UPDATE_PROJECT_EDITOR, UPDATE_PROJECT_VIDEO } from '../actions'
import { filter } from 'lodash'

const updateVideo = (project, url) => {
  let { media } = project || {}
  media = filter(media, m => m.type !== 'video')
  if (url) media.push({type: 'video', url})
  return {...project, media}
}

export default function (state = {}, action) {
  if (action.error) return state

  let { type, payload, meta } = action
  let { id } = meta || {}
  switch (type) {
    case CREATE_PROJECT:
      return {...state, [id]: null}
    case UPDATE_PROJECT_EDITOR:
      return {...state, [id]: {...state[id], ...payload}}
    case UPDATE_PROJECT_VIDEO:
      return {...state, [id]: updateVideo(state[id], payload)}
  }

  return state
}

import { hashtagCharacterRegex } from '../models/hashtag'
import { curry, has } from 'lodash'

export const keyMap = {
  BACKSPACE: 8,
  TAB: 9,
  ENTER: 13,
  ESC: 27,
  SPACE: 32,
  LEFT: 37,
  UP: 38,
  RIGHT: 39,
  DOWN: 40,
  DELETE: 46,
  HASH: 35,
  AT_SIGN: 64
}

export const isKey = (event, keyName) =>
  has(keyMap, keyName) && getKeyCode(event) === keyMap[keyName]

export const getKeyCode = event => event.which || event.keyCode

export const getCharacter = event => String.fromCharCode(getKeyCode(event))

export const sanitizeTagInput = event =>
  getCharacter(event).match(hashtagCharacterRegex) || event.preventDefault()

// use like: <input type='text' onKeyDown={onKeyCode(keyMap.ENTER, callback)}/>
const onKeyCode = curry((keyCode, callback, event) =>
  getKeyCode(event) === keyCode && callback(event))

// use like: <input type='text' onKeyDown={onEnter(callback)}/>
export const onEnter = onKeyCode(keyMap.ENTER)

export const preventSpaces = onKeyCode(keyMap.SPACE, e => e.preventDefault())

import { logLevel } from '../config'

const ERROR = 'error'
const WARN = 'warn'
const INFO = 'info'
const DEBUG = 'debug'

const levels = [ERROR, WARN, INFO, DEBUG]

function logAtLevel (level) {
  if (levels.indexOf(logLevel) >= levels.indexOf(level) && typeof console !== 'undefined') {
    return console.log.bind(console)
  } else {
    return function noop () {}
  }
}

if (levels.indexOf(logLevel) === -1) {
  console.error(`log level name not recognized: "${logLevel}"`)
}

export const error = logAtLevel(ERROR)
export const warn = logAtLevel(WARN)
export const info = logAtLevel(INFO)
export const debug = logAtLevel(DEBUG)

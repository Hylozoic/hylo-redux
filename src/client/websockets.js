import { environment, socketHost } from '../config'
const isClient = typeof window !== 'undefined' && !window.isMock

if (isClient) {
  var socketIOClient = require('socket.io-client')
  var sailsIOClient = require('sails.io.js')
}

export const socketUrl = path => `${socketHost}/${path.replace(/^\//, '')}`

let socket // client-side singleton

export const getSocket = () => {
  if (!isClient) {
    const noop = () => {}
    return {get: noop, post: noop, on: noop, off: noop}
  }

  if (!socket) {
    const io = sailsIOClient(socketIOClient)
    io.sails.url = socketHost
    io.sails.environment = environment
    socket = io.socket
  }
  return socket
}

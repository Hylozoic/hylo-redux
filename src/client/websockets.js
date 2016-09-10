import { environment, host, upstreamHost } from '../config'
if (typeof window !== 'undefined' && !window.isMock) {
  var socketIOClient = require('socket.io-client')
  var sailsIOClient = require('sails.io.js')
}

const socketHost = environment === 'production' ? host : upstreamHost
export const socketUrl = path => `${socketHost}${path}`

let socket // client-side singleton

export const getSocket = () => {
  if (!socket) {
    const io = sailsIOClient(socketIOClient)
    io.sails.url = socketHost
    io.sails.environment = environment
    socket = io.socket
  }
  return socket
}

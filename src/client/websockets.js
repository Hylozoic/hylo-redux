import socketIOClient from 'socket.io-client'
import sailsIOClient from 'sails.io.js'
import { environment, host, upstreamHost } from '../config'

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

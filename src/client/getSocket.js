import socketIOClient from 'socket.io-client'
import sailsIOClient from 'sails.io.js'
import config from '../config'

let socket

export default function () {
  if (!socket) {
    const io = sailsIOClient(socketIOClient)
    io.sails.url = config.upstreamHost
    io.sails.environment = config.environment
    socket = io.socket
  }
  return socket
}

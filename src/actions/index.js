import request from 'request'
import { promisify } from 'bluebird'
const post = promisify(request.post, request)

export const LOGIN = 'LOGIN'

const postLogin = (email, password) => {
  let url = `${window.location.origin}/login`
  return post(url, {form: {email, password}, json: true})
  .then(resp => {
    if (resp.status === 200) return resp.body
    return Promise.reject(resp.body)
  })
}

export function login (email, password) {
  return {
    type: LOGIN,
    payload: postLogin(email, password)
  }
}

export const LOGOUT = 'LOGOUT'

export function logout () {
  return {
    type: LOGOUT
  }
}

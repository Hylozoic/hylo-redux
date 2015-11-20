export const LOGIN = 'LOGIN'

// this is a client-only action
export function login (email, password) {
  return {
    type: LOGIN,
    payload: {api: true, path: '/login', params: {email, password}, method: 'post'}
  }
}

export const LOGOUT = 'LOGOUT'

export function logout () {
  return {
    type: LOGOUT,
    payload: {api: true, path: '/logout', method: 'post'}
  }
}

export const FETCH_USER = 'FETCH_USER'

export function fetchUser (id) {
  return {
    type: FETCH_USER,
    payload: {api: true, path: `/noo/user/${id}`},
    meta: {cache: {bucket: 'users', id}}
  }
}

export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'

export function fetchCurrentUser () {
  return {
    type: FETCH_CURRENT_USER,
    payload: {api: true, path: '/noo/user/me'},
    meta: {cache: {bucket: 'users', id: 'current'}}
  }
}

export const FETCH_COMMUNITY = 'FETCH_COMMUNITY'

export function fetchCommunity (id) {
  return {
    type: FETCH_COMMUNITY,
    payload: {api: true, path: `/noo/community/${id}`},
    meta: {cache: {bucket: 'communities', id}}
  }
}

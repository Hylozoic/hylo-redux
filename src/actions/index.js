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
    type: LOGOUT
  }
}

export const FETCH_USER = 'FETCH_USER'

export function fetchUser (userId) {
  return {
    type: FETCH_USER,
    payload: {api: true, path: `/noo/user/${userId}`}
  }
}

export const FETCH_CURRENT_USER = 'FETCH_CURRENT_USER'

export function fetchCurrentUser () {
  return {
    type: FETCH_CURRENT_USER,
    payload: {api: true, path: '/noo/user/me'}
  }
}

import { configureStore } from '../store'
import { fetchCurrentUser } from '../actions'
import { get } from 'lodash/fp'

// this is defined in hylo-node:config/session.js
const HYLO_COOKIE_NAME = 'hylo.sid.1'

export default function (req, res, next) {
  if (req.url === '/' && req.cookies[HYLO_COOKIE_NAME]) {
    const { store } = configureStore({}, {request: req})
    store.dispatch(fetchCurrentUser())
    .then(() => {
      if (get('people.current', store.getState())) {
        res.redirect('/app?rd=1')
      } else {
        next()
      }
    })
  } else {
    next()
  }
}

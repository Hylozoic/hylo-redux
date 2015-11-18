import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'
import { LOGIN } from '../actions'

export default combineReducers({
  routing: routeReducer,
  loginError: (state = null, action) => {
    if (action.type === LOGIN && action.error) {
      return action.payload
    }
    return state
  },
  count: (state = 0, action) => {
    if (action.type === 'INCREMENT') {
      return state + 1
    }
    return state
  }
})

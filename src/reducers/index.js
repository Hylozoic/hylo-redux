import { combineReducers } from 'redux'
import { routeReducer } from 'redux-simple-router'

export default combineReducers({
  routing: routeReducer,
  count: (state = 0, action) => {
    if (action.type === 'INCREMENT') {
      return state + 1
    }
    return state
  }
})

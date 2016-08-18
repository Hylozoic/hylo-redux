import { merge } from 'lodash'
import { generate } from 'randomstring'

const text = (length = 10) => generate({length, charset: 'alphabetic'})
const number = (range = 10000) => Math.floor(Math.random() * range)

// call store.transformAction(action.type, callback) in test setup if you want
// store.dispatch(action) to return a specific value
const mockReduxStore = function (state) {
  let dispatched = []
  let actionTransforms = {}

  return {
    subscribe: spy(() => {}),
    getState: () => ({...state}),
    dispatched,
    dispatch: spy(action => {
      dispatched.push(action)
      const callback = actionTransforms[action.type]
      return callback ? callback(action) : action
    }),
    transformAction: (actionType, response) => {
      actionTransforms[actionType] = response
    }
  }
}

export default {
  request: function (path) {
    return {originalUrl: path, method: 'GET', headers: {}}
  },
  response: function () {
    let res = {
      headers: {},
      setHeader: spy((key, value) => res.headers[key] = value),
      status: spy(code => {
        res.statusCode = code
        return res
      }),
      send: spy(body => {
        res.body = body
        return res
      }),
      redirect: spy((code, path) => {
        res.statusCode = code
        res.redirectLocation = path
        return res
      })
    }
    return res
  },
  event: function (attrs) {
    return merge({
      preventDefault: spy(() => {}),
      stopPropagation: spy(() => {})
    }, attrs)
  },
  redux: {
    store: mockReduxStore
  },
  models: {
    user: (attrs) => merge({
      id: number(),
      name: text()
    }, attrs)
  }
}

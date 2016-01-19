export default function (state = {}, action) {
  let { type, error, payload, meta } = action
  if (error) {
    return state
  }

  // the cases where there isn't a payload
  switch (type) {

  }

  if (!payload) return state

  switch (type) {
  }

  return state
}

import { compact, map } from 'lodash/fp'

// newrelic must be required as early as possible
const newrelic = process.env.NEW_RELIC_LICENSE_KEY ? require('newrelic') : null

export const setTransactionNameFromProps = (req, props) => {
  if (!newrelic) return
  const txPath = compact(map('path', props.routes)).join('/')
  newrelic.setTransactionName(txPath)
}

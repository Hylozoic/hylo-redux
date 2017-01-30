import { FETCH_RAW_ADMIN_METRICS } from '../constants'

export function fetchRawMetrics () {
  return {
    type: FETCH_RAW_ADMIN_METRICS,
    payload: {api: true, path: '/noo/admin/raw-metrics'}
  }
}

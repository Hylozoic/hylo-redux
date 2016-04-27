import React from 'react'
import { curry, find, sortBy, values } from 'lodash'
import { flatten, flow, get, map, maxBy, minBy } from 'lodash/fp'
import { connect } from 'react-redux'
import { loadScript, loadStylesheet } from '../client/util'
import { fetchRawMetrics } from '../actions/admin'
import moment from 'moment'
const { func, object } = React.PropTypes

const findOrPush = (arr, testFn, valueFn) => {
  const found = find(arr, testFn)
  if (found) return found
  const created = valueFn()
  arr.push(created)
  return created
}

const aggregateData = events => {
  return events.reduce((acc, e) => {
    const label = e.name + 's'
    const date = moment(e.time).startOf('day').toDate()
    const item = findOrPush(acc,
      g => g.date.getTime() === date.getTime(),
      () => ({date}))

    if (item[label]) {
      item[label] += 1
    } else {
      item[label] = 1
    }
    return acc
  }, [])
}

const makeChart = curry((minX, maxX, community) => {
  const data = aggregateData(community.events)
  window.MG.data_graphic({
    data,
    full_width: true,
    height: 160,
    target: '#' + chartDomID(community),
    linked: true,
    min_x: minX,
    max_x: maxX,
    y_accessor: ['users', 'posts', 'comments'],
    legend: ['users', 'posts', 'comments'],
    missing_is_hidden: true,
    top: 15,
    bottom: 25,
    buffer: 0
  })
})

const chartDomID = community => `chart-${community.id}`

@connect(state => ({
  metrics: get('admin.metrics', state)
}))
export default class Admin extends React.Component {
  static propTypes = {
    dispatch: func,
    metrics: object
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  componentDidMount () {
    const { dispatch } = this.props

    // loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/nvd3/1.8.2/nv.d3.min.css')
    // loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js')
    // .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/nvd3/1.8.2/nv.d3.min.js'))
    loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/metrics-graphics/2.9.0/metricsgraphics.min.css')
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js')
    .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/metrics-graphics/2.9.0/metricsgraphics.min.js'))
    .then(() => dispatch(fetchRawMetrics()))
    .then(() => this.setState({ready: true}))
  }

  render () {
    if (!this.state.ready) return <div className='loading'>Loading...</div>

    const { metrics } = this.props
    const communities = sortBy(values(metrics), c => -c.events.length).slice(0, 20)
    const [ minDate, maxDate ] = flow(
      map('events'),
      flatten,
      vals => [minBy('time', vals), maxBy('time', vals)],
      map(val => moment(val.time).startOf('day').toDate())
    )(communities)
    setTimeout(() => communities.forEach(makeChart(minDate, maxDate)))

    return <div className='simple-page' id='admin-page'>
      {communities.map(c => <div key={c.id} className='community'>
        {c.name}
        <div id={chartDomID(c)} className='chart'></div>
      </div>)}
    </div>
  }
}

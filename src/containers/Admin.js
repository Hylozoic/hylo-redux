import React from 'react'
import { curry, find, merge, sortBy, values } from 'lodash'
import { filter, flatten, flow, get, map, maxBy, minBy } from 'lodash/fp'
import { connect } from 'react-redux'
import { loadScript, loadStylesheet } from '../client/util'
import { onEnter } from '../util/textInput'
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

const findOrPushByDate = (arr, event) => {
  const date = moment(event.time).startOf('day').toDate()
  const sameDate = item => item.date.getTime() === date.getTime()
  return findOrPush(arr, sameDate, () => ({date}))
}

const aggregateData = events =>
  events.reduce((acc, e) => {
    const label = e.name + 's'
    const item = findOrPushByDate(acc, e)

    if (item[label]) {
      item[label] += 1
    } else {
      item[label] = 1
    }
    return acc
  }, [])

const sharedChartAttrs = {
  full_width: true,
  height: 160,
  top: 15,
  bottom: 25,
  buffer: 0,
  linked: true,
  missing_is_hidden: true
}

const makeChart = curry((minX, maxX, community) => {
  const data = aggregateData(community.events)
  window.MG.data_graphic(merge({}, sharedChartAttrs, {
    data,
    target: '#' + chartDomID(community),
    min_x: minX,
    max_x: maxX,
    y_accessor: ['users', 'posts', 'comments'],
    legend: ['users', 'posts', 'comments']
  }))
})

const makeUniquesChart = curry((minX, maxX, community) => {
  const data = community.events.reduce((acc, e) => {
    const item = findOrPushByDate(acc, e)
    if (!item.uniques) item.uniques = {}
    if (!item.uniques[e.user_id]) item.uniques[e.user_id] = true
    return acc
  }, [])
  .map(({date, uniques}) => ({date, count: Object.keys(uniques).length}))

  window.MG.data_graphic(merge({}, sharedChartAttrs, {
    data,
    target: '#' + chartDomID2(community),
    min_x: minX,
    max_x: maxX,
    y_accessor: ['count'],
    legend: ['uniques']
  }))
})

const chartDomID = community => `chart-${community.id}`
const chartDomID2 = community => `chart-${community.id}-2`

const findDateRange = communities =>
  flow(
    map('events'),
    flatten,
    vals => [minBy('time', vals), maxBy('time', vals)],
    map(val => moment(val.time).startOf('day').toDate())
  )(communities)

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
    this.state = {loginAs: '', communitySelection: 'top10'}
  }

  componentDidMount () {
    const { dispatch } = this.props

    loadStylesheet('https://cdnjs.cloudflare.com/ajax/libs/metrics-graphics/2.9.0/metricsgraphics.min.css')
    loadScript('https://cdnjs.cloudflare.com/ajax/libs/d3/3.5.16/d3.min.js')
    .then(() => loadScript('https://cdnjs.cloudflare.com/ajax/libs/metrics-graphics/2.9.0/metricsgraphics.min.js'))
    .then(() => dispatch(fetchRawMetrics()))
    .then(() => {
      const { metrics } = this.props
      const communities = sortBy(values(metrics), c => -c.events.length).slice(0, 20)
      ;[ this.minDate, this.maxDate ] = findDateRange(communities)
      this.setState({rerender: true, communitySelection: 'top10'})
    })
  }

  render () {
    const { metrics } = this.props
    if (!metrics) return <div className='loading'>Loading...</div>
    const { communitySelection, loginAs, rerender } = this.state
    let communities

    switch (communitySelection) {
      case 'top10':
        communities = sortBy(values(metrics), c => -c.events.length).slice(0, 10)
        break
      case 'top50':
        communities = sortBy(values(metrics), c => -c.events.length).slice(0, 50)
        break
      default:
        communities = filter(c => c.id === communitySelection, metrics)
    }

    if (rerender) {
      setTimeout(() => {
        this.setState({rerender: false})
        communities.forEach(c => {
          makeChart(this.minDate, this.maxDate, c)
          makeUniquesChart(this.minDate, this.maxDate, c)
        })
      })
    }

    const go = () => window.location = `/noo/admin/login-as/${loginAs}`
    const allCommunities = sortBy(metrics, c => c.name.toLowerCase())

    return <div className='simple-page' id='admin-page'>
      <ul>
        <li>
          Log in as:&nbsp;
          <input type='text' value={loginAs}
            placeholder='User ID or email'
            onChange={e => this.setState({loginAs: e.target.value})}
            onKeyDown={onEnter(go)} />
        </li>
        <li><a href='/admin/kue'>Kue</a></li>
        <li><a href='/noo/admin/logout'>Log out</a></li>
      </ul>

      <p>
        <select value={communitySelection} onChange={e => this.setState({communitySelection: e.target.value, rerender: true})}>
          <option value='top10'>Top 10</option>
          <option value='top50'>Top 50</option>
          {allCommunities.map(c =>
            <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </p>

      {communities.map(c => <div key={c.id} className='community'>
        {c.name}
        <div id={chartDomID(c)} className='chart'></div>
        <div id={chartDomID2(c)} className='chart'></div>
      </div>)}
    </div>
  }
}

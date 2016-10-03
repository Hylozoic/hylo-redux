import React from 'react'
import { compose } from 'redux'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchPeople } from '../../actions/fetchPeople'
import { fetchWithCache, connectedListProps } from '../../util/caching'
import ScrollListener from '../../components/ScrollListener'
import PersonCards from '../../components/PersonCards'
const { array, bool, func, number, object } = React.PropTypes

const subject = 'network'
const fetch = fetchWithCache(fetchPeople)

const NetworkMembers = compose(
  prefetch(({ dispatch, params: { id }, query }) => dispatch(fetch(subject, id, query))),
  connect((state, { params: { id }, location: { query } }) => {
    return {
      ...connectedListProps(state, {subject, id, query}, 'people'),
      network: state.networks[id]
    }
  })
)(props => {
  let { pending, people, location: { query } } = props

  let loadMore = () => {
    let { dispatch, total, params: { id } } = props
    let offset = people.length
    if (!pending && offset < total) {
      dispatch(fetch(subject, id, {...query, offset}))
    }
  }

  return <div className='members'>
    {pending && <div className='loading'>Loading...</div>}
    <PersonCards people={people}/>
    <ScrollListener onBottom={loadMore}/>
  </div>
})

NetworkMembers.propTypes = {
  people: array,
  pending: bool,
  dispatch: func,
  total: number,
  params: object,
  location: object
}

export default NetworkMembers

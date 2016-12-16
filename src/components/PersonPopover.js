import React from 'react'
import { connect } from 'react-redux'
import A from './A'
import Avatar from './Avatar'
import { get } from 'lodash'
import { navigate, fetchPerson } from '../actions'
const { object, func, string } = React.PropTypes

@connect(({ people }, { userId }) => {
  const person = get(people, userId)
  return { person }
})
export default class PersonPopover extends React.Component {
  static propTypes = {
    userId: string,
    dispatch: func,
    person: object
  }

  componentDidMount () {
    const { dispatch, userId } = this.props
    dispatch(fetchPerson(userId))
  }

  render () {
    const { person } = this.props

    return <span className='person-popover'>
      {person.id}
      {person.name}
      {person.avatar_url}
      {person.bio}      
    </span>
  }
}

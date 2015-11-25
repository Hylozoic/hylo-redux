import React from 'react'
import { connect } from 'react-redux'
const { object } = React.PropTypes

@connect((state, { params }) => ({person: state.people[params.id]}))
export default class AboutPerson extends React.Component {
  static propTypes = {
    person: object
  }

  render () {
    let { person } = this.props
    return <div className='about'>
      <section>
        <h4>What I am doing</h4>
        <p>{person.bio}</p>
      </section>
      <section>
        <h4>What I would like to do</h4>
        <p>{person.intention}</p>
      </section>
    </div>
  }
}

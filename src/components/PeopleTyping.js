import React from 'react'
const { array, bool, func, object, string } = React.PropTypes

export default class PeopleTyping extends React.Component {

  static propTypes = {
    names: array,
    showNames: bool
  }

  render () {
    const { names, showNames } = this.props
    return <div className='typing'>
      {!showNames && names.length == 1 && <div>someone is typing</div>}
      {showNames && names.length == 1 && <div>{names[0]} is typing</div>}
      {names.length > 1 && <div>multiple people are typing</div>}
    </div>
  }

}

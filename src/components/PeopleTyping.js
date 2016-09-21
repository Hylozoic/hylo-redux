import React from 'react'
const { array, bool } = React.PropTypes

export default class PeopleTyping extends React.Component {
  static propTypes = {
    names: array,
    showNames: bool
  }

  render () {
    const { names, showNames } = this.props
    return <div className='typing'>
      <Chillipsis/>
      {names.length === 1 && <div>
        {showNames ? names[0] : 'Someone'} is typing...
      </div>}
      {names.length > 1 && <div>Multiple people are typing...</div>}
    </div>
  }
}

const Chillipsis = () => {
  return <div className='chillipsis'>
    <div className='dot d1'></div>
    <div className='dot d2'></div>
    <div className='dot d3'></div>
  </div>
}

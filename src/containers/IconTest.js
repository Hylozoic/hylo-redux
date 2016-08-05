import React from 'react'
import Tooltip from '../components/Tooltip'

export default class IconTest extends React.Component {

  render () {
    return <div id='icon-test'>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>
        <Tooltip
          id='test'
          active={true}
          title='Topics'
          body='The topics you follow or create will be listed here for easy access and notifications on new activities'
          />
      </div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
      <div>la</div>
    </div>
  }
}

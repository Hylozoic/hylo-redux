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
          id='test31'
          index={3}
          title='Topics (3)'
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
        <div>lalalalalalalalalalalalalalala
          lalalalalalalalalalalalalalalalalalalalalalala
          lalalalalalalalalalalalalalalalalalalalalalalala<Tooltip
            id='test11'
            index={1}
            title='Topics (1)'
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

        <div>la</div>
        <div>lalalalalalalalalalalalalalala
          lalalalalalalalalalalalalalalalalalalalalalala
          lalalalalalalalalalalalalalalalalalalalalalalala<Tooltip
            id='test21'
            index={2}
            title='Topics (2)'
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

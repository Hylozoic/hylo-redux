import React from 'react'
const { object } = React.PropTypes
import ModalOnlyPage from '../components/ModalOnlyPage'
import ModalInput, { ModalField } from '../components/ModalInput'
import Modal from '../components/Modal'

const merkabaUrl = 'https://www.hylo.com/img/hylo-merkaba-300x300.png'

export const CreateCommunity = ({ children }) => <div className>
  {children}
</div>

export class CreateCommunityContainer extends React.Component {
  static propTypes = {
    children: object
  }

  render () {
    const { children } = this.props

    return <ModalOnlyPage>
      <div className='modal-topper'>
        <div className='medium-avatar' style={{backgroundImage: `url(${merkabaUrl})`}}/>
        <h2>Create</h2>
      </div>}
      {children}
    </ModalOnlyPage>
  }
}

const URLInput = ({ value }) => {
  const Field = ({ onFocus, onBlur }) => <span>
    <span className='url-prefix'>https://hylo.com/c/</span>
    <input type='text'
      value={value}
      onFocus={onFocus}
      onBlur={onBlur} />
  </span>
  return <ModalField Field={Field} label='URL'/>
}

export class CreateCommunityOne extends React.Component {

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const error = false

    return <Modal title='Create your community.'
      subtitle="Let's get started unlocking the creative potential of your community with Hylo"
      standalone>
      <form onSubmit={this.submit}>
        {error && <div className='alert alert-danger'>{error}</div>}
        <ModalInput label='Name' ref='name'/>
        <URLInput />
        <div className='footer'>
          <input ref='submit' type='submit' value='Create'/>
        </div>
      </form>
    </Modal>
  }
}

export class CreateCommunityTwo extends React.Component {

  render () {
    const error = false

    return <Modal title='Create your community.'
      subtitle="Let's get started unlocking the creative potential of your community with Hylo"
      standalone>
      <form onSubmit={this.submit}>
        {error && <div className='alert alert-danger'>{error}</div>}
        <ModalInput label='Name' ref='name'/>
        <ModalInput label='URL' ref='url'/>
        <div className='footer'>
          <input ref='submit' type='submit' value='Create'/>
        </div>
      </form>
    </Modal>
  }
}

export class CreateCommunityThree extends React.Component {

  render () {
    const error = false

    return <Modal title='Create your community.'
      subtitle="Let's get started unlocking the creative potential of your community with Hylo"
      standalone>
      <form onSubmit={this.submit}>
        {error && <div className='alert alert-danger'>{error}</div>}
        <ModalInput label='Name' ref='name'/>
        <ModalInput label='URL' ref='url'/>
        <div className='footer'>
          <input ref='submit' type='submit' value='Create'/>
        </div>
      </form>
    </Modal>
  }
}

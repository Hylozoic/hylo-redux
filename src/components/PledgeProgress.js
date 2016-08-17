import React from 'react'
import { connect } from 'react-redux'
import numeral from 'numeral'
import { fetchProjectPledgeProgress } from '../actions'
const { func, object } = React.PropTypes


@connect()
export default class PledgeProgress extends React.Component {
  static propTypes = {
    post: object.isRequired
  }

  static contextTypes = {
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = { currencyPledgeAmount : "$0" }
  }

  updateProjectPledgeProgress (post, dispatch) {
    dispatch(fetchProjectPledgeProgress(post.id))
     .then((res) => this.setState({currencyPledgeAmount: numeral(res).format('$0,0.00')}))
  }

  setPollInterval (post, dispatch) {
    if (this.pollInterval) {
      clearInterval(this.pollInterval)
    }

    this.pollInterval = setInterval(() => { this.updateProjectPledgeProgress (post, dispatch) } , 60 * 1000)
  }

  componentDidMount (){
    const { post } = this.props
    const { dispatch } = this.context
    //setTimeout(() => { this.updateProjectPledgeProgress (post, dispatch) } , 3 * 1000)
    //this.setPollInterval(post, dispatch)
  }

  componentWillUnmount () {
    clearInterval(this.pollInterval)
  }

  render () {
    const { post } = this.props
    const { financialRequestAmount } = post
    const currencyAmount = numeral(financialRequestAmount).format('$0,0.00')

    return <div className='supporters'>
      <div className='top'>
        <h2>{this.state.currencyPledgeAmount}</h2>
        <span className='meta'>
        pledged of {currencyAmount} goal
      </span>
      </div>
    </div>
  }
}

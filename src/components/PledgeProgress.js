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
     .then((res) => {
       if(res){
         if(res.error){
           console.error(res.payload.message)
           this.timeoutPointer = setTimeout(() => { this.updateProjectPledgeProgress (post, dispatch) } , 10 * 1000)
         }else{
           const pledgeAmount = res.payload.pledgeAmount
           if(pledgeAmount){
             this.setState({currencyPledgeAmount: numeral(pledgeAmount).format('$0,0.00')})
           }
           this.timeoutPointer = setTimeout(() => { this.updateProjectPledgeProgress (post, dispatch) } , 1 * 1000)
         }
       }
     }, (err) => {
       console.error(err)
       this.timeoutPointer = setTimeout(() => { this.updateProjectPledgeProgress (post, dispatch) } , 10 * 1000)
     })
  }

  componentDidMount (){
    const { post } = this.props
    const { dispatch } = this.context
    this.timeoutPointer = setTimeout(() => { this.updateProjectPledgeProgress (post, dispatch) } , 3 * 1000)
  }

  componentWillUnmount () {
    clearTimeout(this.timeoutPointer)
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

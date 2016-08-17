import React from 'react'
import { connect } from 'react-redux'
import Icon from './Icon'
import DatetimePicker from 'react-datetime'
import moment from 'moment'
import { sanitizeTagInput } from '../util/textInput'
import { validateTag } from './EventPostEditor'
import { getCurrentCommunity } from '../models/community'
import { debounce } from 'lodash'
import { get, map, pick } from 'lodash/fp'
import { getPost, getVideo } from '../models/post'
import CurrencyInput from 'react-currency-input'
import ConnectHitfin from './ConnectHitfin'
const { array, func, object, bool, string } = React.PropTypes

const random = () => Math.random().toString().slice(2, 8)

const getSimplePost = state => id =>
  pick(['id', 'name', 'description'], getPost(id, state))

@connect((state, { postEdit }) => ({
  requests: postEdit.requests || map(getSimplePost(state), postEdit.children),
  communityFinanceEnabled: getCurrentCommunity(state).financial_requests_enabled

}), null, null, {withRef: true})
export default class ProjectPostEditor extends React.Component {
  static propTypes = {
    postEdit: object,
    post: object,
    communityFinanceEnabled: bool,
    financialRequestAmount: string,
    update: func.isRequired,
    requests: array.isRequired
  }

  static contextTypes = {dispatch: func}

  componentDidMount () {
    // we update the store as soon as the component is mounted in order to load
    // data from the existing requests into the postEdit. otherwise, if we
    // didn't change them and then saved the post, they would be removed.
    const { update, requests } = this.props
    update({requests})
  }

  validate = () => {
    const { postEdit: { tag }, post } = this.props
    return tag === get('tag', post) ? true
      : validateTag(tag, this.context.dispatch)
  }

  addRequest = () => {
    const { update, requests } = this.props
    update({requests: [...requests, {id: `new-${random()}`}]})
  }

  updateRequest = index => (key, value) => {
    const updatedRequest = {...this.props.requests[index], [key]: value}
    const requests = this.props.requests.slice()
    requests.splice(index, 1, updatedRequest)
    this.props.update({requests})
  }

  checkFinancialRequestsAllowed = () => {
    return this.props.communityFinanceEnabled ||
      this.props.postEdit.financialRequestsEnabled ||
      this.props.postEdit.financialRequestAmount
  }

  toggleEnableFinancialContributions = (event) => {
    const { update, postEdit } = this.props

    if (!postEdit.financialRequestsEnabled) {
      if (postEdit.communities && postEdit.communities.length > 1) {
        window.alert('Financial projects can only be posted in one community.')
        return
      }
    } else {
      update({financialRequestAmount: undefined})
    }

    update({financialRequestsEnabled: !postEdit.financialRequestsEnabled})
  }

  checkIfEdit = () => {
    return !!this.props.post
  }

  valueOfEndTime = (end_time) => {
    if (!!end_time) {
      if (moment(end_time).format("MM/DD/YYYY hh:mm A") === 'Invalid date') {
        return undefined
      } else {
        return moment(end_time).format("MM/DD/YYYY hh:mm A")
      }
    }
    return null
  }

  deadlineDatePicker = (end_time) => {
    let deadlineDatePicker
    if(this.checkIfEdit && this.financialRequestsEnabled){
      deadlineDatePicker = <input type="text" className="end_time"
             value={this.valueOfEndTime(end_time)}
             disabled/>
    }
    else {
      deadlineDatePicker = <DatetimePicker inputProps={{placeholder: 'deadline'}}
                      value={this.valueOfEndTime(this.props.postEdit.end_time)}
                      onChange={m => this.props.update({end_time: this.valueOfEndTime(m)})}/>
    }
    return deadlineDatePicker
  }

  render () {
    const { postEdit, update, requests } = this.props
    const { end_time, tag, type } = postEdit
    const updateTag = tag => update({tag, tagEdited: true})
    const videoUrl = get('url', getVideo(postEdit)) || ''
    if (type !== 'project') setTimeout(() => update({type: 'project'}))
    return <div className='project-editor form-sections'>
      <h3>
        Requests
        <span className='soft normal'>&nbsp;&mdash; what you need to make it happen</span>
      </h3>
      <div className='requests'>
        {requests.map((p, i) => <ProjectRequestEditor post={p} key={p.id}
                                                      update={this.updateRequest(i)}/>)}
        <a className='add-request' onClick={this.addRequest}>+ Add request</a>
      </div>
        {this.checkFinancialRequestsAllowed() &&
      <h3>
        Financial Contributions
      </h3>
        }
        {this.checkFinancialRequestsAllowed() &&
            <div className='requests'>

                <label>
                    <div>
                        Enable Financial Contributions
                        <input type='checkbox' className='right'
                               disabled={this.checkIfEdit()}
                               onClick={this.toggleEnableFinancialContributions}
                               value={postEdit.financialRequestsEnabled}/>
                    </div>
                </label>

                {(postEdit.financialRequestsEnabled) &&
                <div className='section-item financial-request'>
                  <ConnectHitfin message='Connect a HitFin account so that you can enable financial contributions to your project'>
                    <div className='title'>
                        How much do you need?
                    </div>
                    <div>
                        USD $
                        <CurrencyInput value={postEdit.financialRequestAmount}
                                       disabled={this.checkIfEdit()}
                                       thousandSeparator=''
                                       onChange={maskedValue => update({financialRequestAmount: maskedValue})}/>
                    </div>
                  </ConnectHitfin>
                </div>
                }
            </div>
        }

      <div className='more-fields'>
        <div className='video'>
          <Icon name='VideoCamera'/>
          <input type='text' placeholder='youtube or vimeo url'
            value={videoUrl}
            onChange={event => update({video: event.target.value})}/>
        </div>
        <div className='deadline'>
          <Icon name='Calendar'/>
          {this.deadlineDatePicker()}
        </div>
        <div className='location'>
          <Icon name='Pin-1'/>
          <input type='text' placeholder='location'
            defaultValue={postEdit.location}
            onChange={event => update({location: event.target.value})}/>
        </div>
        <div className='hashtag'>
          <Icon name='Tag' />
          <input type='text' placeholder='hashtag' value={tag}
            onKeyPress={sanitizeTagInput}
            onChange={event => updateTag(event.target.value)}/>
        </div>
      </div>
    </div>
  }
}

import AutosizingTextarea from './AutosizingTextarea'
import RichTextEditor from './RichTextEditor'
import cx from 'classnames'

class ProjectRequestEditor extends React.Component {
  static propTypes = {
    post: object,
    update: func
  }

  constructor (props) {
    super(props)
    this.state = pick(['name', 'description'], props.post)
  }

  goToDetails = () => {
    this.setState({showDetails: true})
    this.refs.details.focus()
  }

  delayedUpdate = debounce(function (attr, value) {
    return this.props.update(attr, value)
  }, 100)

  render () {
    const { post: { id } } = this.props
    const { name, description } = this.state
    const handleChange = attr => event => {
      const { value } = event.target
      this.setState({[attr]: value})
      this.delayedUpdate(attr, value)
    }

    const showDetails = this.state.showDetails || !!description
    const editorClass = cx('details', {empty: !showDetails})

    return <div className='request'>
      <div className='title-wrapper'>
        <AutosizingTextarea type='text' ref='title' className='title'
          value={name}
          placeholder='What do you need help with?'
          onChange={handleChange('name')}/>
      </div>

      <RichTextEditor className={editorClass} ref='details' name={`post-${id}`}
        content={description}
        onChange={handleChange('description')}
        onBlur={() => this.setState({showDetails: false})}/>
      {!showDetails &&
        <div className='details-placeholder' onClick={this.goToDetails}>
          More details
        </div>}
    </div>
  }
}

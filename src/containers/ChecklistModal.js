import React from 'react'
import { connect } from 'react-redux'
import { filter } from 'lodash/fp'
import { getCurrentCommunity, getChecklist } from '../models/community'
import Modal from '../components/Modal'
import { closeModal } from '../actions'
const { array, object } = React.PropTypes

class ChecklistModal extends React.Component {
  static propTypes = {community: object, checklist: array}

  render () {
    const { community, checklist, close } = this.props
    const percent = filter('done', checklist).length / checklist.length * 100

    return <Modal title='Getting started.'
      subtitle={<div>
        <PercentBar percent={percent} />
        To build a successful community with Hylo, we suggest completing the following:
      </div>}
      className='community-setup-checklist'>
      {checklist.map(({ title, onClick, done }) =>
        <CheckItem title={title} done={done} key={title} slug={community.slug}
          onClick={onClick} />)}
      <div className='footer'>
        <a className='button ok' onClick={close}>
          Done
        </a>
      </div>
    </Modal>
  }
}

function mapStateToProps (state) {
  return {community: getCurrentCommunity(state)}
}

function mergeProps ({ community }, { dispatch }, props) {
  const checklist = getChecklist(community)
  checklist.forEach(item => {
    item.onClick = () => dispatch(item.action)
  })
  return Object.assign({}, props, {
    community,
    checklist,
    close: () => dispatch(closeModal())
  })
}

export default connect(mapStateToProps, null, mergeProps)(ChecklistModal)

function CheckItem ({ title, onClick, done, slug }) {
  const completedTopic = done && title === 'Add a topic'
  return <div className='check-item form-sections' onClick={!completedTopic && onClick}>
    <input type='checkbox' checked={done} readOnly />
    {title}&nbsp;
    {completedTopic &&
      <a href={`/c/${slug}/settings/tags`} className='see-all-topics'>See all topics</a>}
    <span className='disclosure'>&#x3009;</span>
  </div>
}

export function PercentBar ({ percent }) {
  return <div className='percent-bar'>
    <div className='bar'>
      <div className='completed-portion' style={{width: `${percent}%`}} />
    </div>
    <div className='label'>
      {percent}% completed
    </div>
  </div>
}

import React from 'react'
import { connect } from 'react-redux'
import { prefetch } from 'react-fetcher'
import { filter } from 'lodash/fp'
import { getCurrentCommunity, getChecklist } from '../models/community'
import { Modal } from '../components/Modal'
import { fetchCommunity, updateCommunityChecklist, closeModal } from '../actions'
const { func, object } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(updateCommunityChecklist(id))
  .then(() => dispatch(fetchCommunity(id)))
)
@connect((state) => ({
  community: getCurrentCommunity(state)
}))
export default class ChecklistModal extends React.Component {
  static propTypes = {
    dispatch: func,
    community: object,
    onCancel: func
  }

  render () {
    const { community, dispatch, onCancel } = this.props
    const checklist = getChecklist(community)
    const percent = filter('done', checklist).length / checklist.length * 100
    const close = () => dispatch(closeModal())

    return <Modal title='Getting started.'
      subtitle={<div>
        <PercentBar percent={percent} />
        To build a successful community with Hylo, we suggest completing the following:
      </div>}
      className='community-setup-checklist'
      onCancel={onCancel}>
      {checklist.map(({ title, action, done }) =>
        <CheckItem title={title} done={done} key={title} slug={community.slug}
          onClick={() => dispatch(action)} />)}
      <div className='footer'>
        <a className='button ok' onClick={close}>
          Done
        </a>
      </div>
    </Modal>
  }
}

const CheckItem = ({ title, onClick, done, slug }) => {
  const completedTopic = done && title === 'Add a topic'
  return <div className='check-item form-sections' onClick={!completedTopic && onClick}>
    <input type='checkbox' checked={done} readOnly />
    {title}&nbsp;
    {completedTopic &&
      <a href={`/c/${slug}/settings/tags`} className='see-all-topics'>See all topics</a>}
    <span className='disclosure'>&#x3009;</span>
  </div>
}

export const PercentBar = ({ percent }) => {
  return <div className='percent-bar'>
    <div className='bar'>
      <div className='completed-portion' style={{width: `${percent}%`}}></div>
    </div>
    <div className='label'>
      {percent}% completed
    </div>
  </div>
}

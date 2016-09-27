import React from 'react'
import { getChecklist, getCurrentCommunity } from '../../models/community'
import { connect } from 'react-redux'
import { filter } from 'lodash/fp'
const { func, object } = React.PropTypes
import ModalOnlyPage from '../../components/ModalOnlyPage'
import Modal from '../../components/Modal'
import A from '../../components/A'
import { Topper } from '../CreateCommunity'
import { prefetch } from 'react-fetcher'
import { fetchCommunity, updateCommunityChecklist } from '../../actions/communities'
import { navigate } from '../../actions'

@prefetch(({ dispatch, params: { id } }) =>
  dispatch(updateCommunityChecklist(id))
  .then(() => dispatch(fetchCommunity(id)))
)
@connect((state, { params: { id } }) => ({
  community: id ? state.communities[id] : getCurrentCommunity(state)
}))
export default class CommunityChecklist extends React.Component {
  static propTypes = {dispatch: func, community: object}

  render () {
    const { community, dispatch } = this.props
    const checklist = getChecklist(community)
    const percent = filter('done', checklist).length / checklist.length * 100

    return <ModalOnlyPage className='create-community' id='community-checklist'>
      <Topper community={community}/>
      <Modal title='Getting started.'
        subtitle={<div>
          <PercentBar percent={percent}/>
          To build a successful community with Hylo, we suggest completing the following:
        </div>}
        className='create-community-three'
        standalone>
        {checklist.map(({ title, url, done }) =>
          <CheckItem title={title} done={done} key={title}
            onClick={() => dispatch(navigate(url))}/>)}
        <div className='footer'>
          <A className='button ok' to={`/c/${community.slug}`}>
            Continue to your community
          </A>
        </div>
      </Modal>
    </ModalOnlyPage>
  }
}

const CheckItem = ({ title, onClick, done }) => {
  return <div className='check-item form-sections' onClick={onClick}>
    <input type='checkbox' checked={done}/>
    {title}
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

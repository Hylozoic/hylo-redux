import React from 'react'
import CurrencyInput from 'react-currency-input'
import { connect } from 'react-redux'
import { Header, CommentSection, presentDescription } from './Post'
import decode from 'ent/decode'
import { textLength, truncate } from '../util/text'
import { isEmpty } from 'lodash'
import { find, some } from 'lodash/fp'
import { same } from '../models'
import { getComments, getPost, imageUrl } from '../models/post'
import { getCurrentCommunity } from '../models/community'
import Icon from './Icon'
import Post from './Post'
import Video from './Video'
import Avatar from './Avatar'
import LinkedPersonSentence from './LinkedPersonSentence'
import PledgeProgress from './PledgeProgress'
import uuid from 'uuid'
import A from './A'
import { ClickCatchingSpan } from './ClickCatcher'
import { fetchPost, followPost, navigate, contributeProject } from '../actions'
import moment from 'moment'
import numeral from 'numeral'
import { validatePledge } from '../util/validator'
import _ from 'lodash'
import PromptBecomeEconomicAgent from './PromptBecomeEconomicAgent'
const { array, bool, func, object, number } = React.PropTypes

const Deadline = ({ time }) => {
  const then = moment(time)
  const now = moment()
  const classes = ['deadline']
  if (then.diff(now, 'days') < 10) classes.push('soon')
  return <span className={classes.join(' ')} title={then.format('LLLL')}>{moment(time).toNow(true)} to go</span>
}

function getFinanciallyEnabled (post) {
  return !!post.financialRequestAmount
}

@connect((state) => ({
  currentUser: state.people.current
}))
class ProjectPost extends React.Component {
  static propTypes = {
    post: object.isRequired,
    community: object,
    comments: array,
    communities: array,
    dispatch: func,
    financiallyEnabled: bool,
    currentUser: object
  }

  constructor (props) {
    super(props)
  }

  render () {
    const {community, post, communities, comments, currentUser } = this.props
    const financiallyEnabled = getFinanciallyEnabled(post)
    const { tag, media, location, user, children, name } = post
    const title = decode(name || '')
    const video = find(m => m.type === 'video', media)
    const image = find(m => m.type === 'image', media)
    const description = presentDescription(post, community)
    const requests = children || []

    return (<div className='post project boxy-post'>
              <Header communities={communities} />
              <p className='title post-section'>
                {title}
              </p>
              {tag && <p className='hashtag'>
                        #
                        {tag}
                      </p>}
              <div className='box'>
                {video
                   ? <div className='video-wrapper'>
                       <Video url={video.url} />
                     </div>
                   : image && <div className='image'>
                                <img src={image.url} />
                              </div>}
                <div className='row'>
                  <div className='main-col'>
                    {location && <div className='meta location'>
                                   <Icon name='Pin-1' />
                                   <span title={location}>{location}</span>
                                 </div>}
                    {description && <div className='details'>
                                      <h3>Description</h3>
                                      <ClickCatchingSpan dangerouslySetInnerHTML={{__html: description}} />
                                    </div>}
                    <div className='leads'>
                      <h3>Project leads</h3>
                      <Avatar person={user} />
                      <div className='person-info'>
                        <A className='name' to={`/u/${user.id}`}>
                          {user.name}
                        </A>
                        <p>
                          {user.bio}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className='side-col'>
                    {post.financialRequestAmount && post.syndicateIssueId && <PledgeProgress post={post} />}
                    <Supporters post={post} financiallyEnabled={financiallyEnabled} currentUser={currentUser} />
                  </div>
                </div>
              </div>
              {requests.length > 0 && <div className='requests'>
                                        <h3>{requests.length} request{requests.length === 1 ? '' : 's'}&nbsp <span className='soft'>to make this happen</span></h3>
                                        {requests.map(id => <ProjectRequest key={id} {...{id, community}}/>)}
                                      </div>}
              <CommentSection post={post} comments={comments} expanded/>
            </div>)
  }
}

export default ProjectPost

class Supporters extends React.Component {
  static propTypes = {
    post: object,
    simple: bool,
    currentUser: object,
    dispatch: func,
    financiallyEnabled: bool,
    pledgeAmount: number,
    currentUser: object
  }

  static contextTypes = {
    dispatch: func
  }

  constructor (props) {
    super(props)
    this.state = {
      pledgeDialogueVisible: false,
      pledging: false
    }
  }

  setPledgeDialogueVisible = () => {
    this.setState({pledgeDialogueVisible: !this.state.pledgeDialogueVisible})
    if (!this.state.pledgeDialogueVisible) {
      this.props.post.pledgeAmount = undefined
    }
  }

  updatePledge = (pledgeAmount) => {
    this.props.post.pledgeAmount = pledgeAmount
  }

  makePledge = (pledgeAmount) => {
    validatePledge(pledgeAmount).then(valid => {
      if (!valid) return
      // we use setTimeout here to avoid a race condition. the description field
      // (tinymce) doesn't fire its change event until it loses focus, and
      // there's an additional delay due to the use of setDelayed.
      //
      // so if we click Save immediately after typing in the description
      // field, we have to wait for events from the description field to be
      // handled, otherwise the last edit will be lost.
      setTimeout(() => this.save(pledgeAmount), 200)
    })
  }

  save = (pledgeAmount) => {
    const {dispatch} = this.context
    this.setState({pledgeDialogueVisible: false})
    this.setState({pledging: true})
    const transactionId = uuid.v1()
    dispatch(contributeProject(this.props.post.id, {amount: pledgeAmount, transactionId: transactionId})).then((res) => {
      if (res && res.error) {
        alert('Failed. Please try again in a few minutes')
      }
      this.setState({pledging: false})
    })
  }

  currentUserIsEconomicAgent = () => {
    let currentUserHitfinLinkedAccount = _.find(this.props.currentUser.linkedAccounts, (acc) => acc.provider_key === 'hit-fin')
    return !!currentUserHitfinLinkedAccount
  }

  render () {
    const { post, simple, currentUser, financiallyEnabled, update } = this.props
    let { pledgeDialogueVisible, pledging } = this.state
    const { followers, end_time } = post
    const isFollowing = some(same('id', currentUser), followers)
    const follow = () => dispatch(followPost(post.id, currentUser))

    return <div className='supporters'>
             {!simple && <div className='top'>
                           <h3>{followers.length} supporter{followers.length === 1 ? '' : 's'}</h3>
                           {end_time && <Deadline time={end_time} />}
                         </div>}
             {!isEmpty(followers) && <LinkedPersonSentence people={followers} className='blurb meta'>
                                       support
                                       {followers.length > 1 || some(same('id', currentUser), followers) ? '' : 's'}
                                       <span>this.</span>
                                     </LinkedPersonSentence>}
             <div className='avatar-list'>
               {followers.map(person => <Avatar person={person} key={person.id} />)}
             </div>
             {!simple && <a className='support button has-icon' onClick={follow}>
                           <Icon name={isFollowing ? 'ok-sign' : 'plus-sign'} glyphicon/>
                           {isFollowing ? 'Supporting' : 'Support this'}
                         </a>}
             {!simple && financiallyEnabled && post.syndicateIssueId && !pledgeDialogueVisible && !pledging &&
              <button type='button' className='button pledge' onClick={this.setPledgeDialogueVisible}>
                Make A Pledge
              </button>}
             {!simple && pledgeDialogueVisible && financiallyEnabled && post.syndicateIssueId && this.currentUserIsEconomicAgent() &&
                            <div className='pledge'>
                              <div> How much would you like to pledge?</div>
                              USD $
                              <CurrencyInput
                                  value={this.props.post.pledgeAmount}
                                  className='pledge-amount'
                                  onChange={maskedValue => this.updatePledge(maskedValue)}
                                  thousandSeparator=''/>
                              <button type='button' className='button cancel-pledge' onClick={this.setPledgeDialogueVisible} >Cancel</button>
                              <button type='button' className='button submit-pledge' onClick={() => this.makePledge(this.props.post.pledgeAmount)}>Pledge</button>
                            </div>}
             {!simple && pledgeDialogueVisible && !this.currentUserIsEconomicAgent() &&
              <PromptBecomeEconomicAgent />}
           </div>
  }
}

@connect((state, { id }) => ({
  post: getPost(id, state)
}))
class ProjectRequest extends React.Component {
  static propTypes = {
    post: object.isRequired,
    community: object,
    financiallyEnabled: bool
  }

  static contextTypes = {
    dispatch: func,
    isMobile: bool
  }

  static childContextTypes = {
    isProjectRequest: bool
  }

  getChildContext () {
    return {isProjectRequest: true}
  }

  constructor (props) {
    super(props)
    this.state = {}
  }

  render () {
    const { dispatch, isMobile } = this.context
    const { post, community } = this.props
    const { name, id, numComments } = post
    let description = presentDescription(post, community)
    const truncated = textLength(description) > 200
    if (truncated) {
      description = truncate(description, 200)
    }

    const zoom = () => {
      if (isMobile) {
        dispatch(navigate(`/p/${post.id}`))
      } else {
        this.setState({zoomed: true})
        dispatch(fetchPost(id))
      }
    }
    const unzoom = () => this.setState({zoomed: false})

    return <div className='nested-request'>
             {this.state.zoomed && <div className='zoomed'>
                                     <div className='backdrop' onClick={unzoom} />
                                     {post.user && <Post post={post} expanded/>}
                                   </div>}
             <p className='title'>
               {name}
             </p>
             {description && <ClickCatchingSpan className='details' dangerouslySetInnerHTML={{__html: description}} />}
             {truncated && <span><A to={`/p/${id}`} className='show-more'> Show more </A></span>}
             <div className='meta'>
               <a className='help button has-icon' onClick={zoom}>
                 <Icon name='plus-sign' glyphicon/> Offer to help</a>
               {numComments > 0 && <a onClick={zoom}>
                                     {numComments} comment
                                     {numComments === 1 ? '' : 's'}
                                   </a>}
             </div>
           </div>
  }
}

const spacer = <span>•</span>

export const ProjectPostCard = connect(
  (state, { post }) => ({
    comments: getComments(post, state),
    community: getCurrentCommunity(state),
    isMobile: state.isMobile
  })
)(({ post, community, comments, dispatch, isMobile }) => {
  const { name, user, tag, end_time, id } = post
  const url = `/p/${post.id}`
  const backgroundImage = `url(${imageUrl(post)})`

  let description = presentDescription(post, community)
  const truncated = textLength(description) > 140
  if (truncated) {
    description = truncate(description, 140)
  }

  return <div className='post project-summary'>
           <A className='image' to={url} style={{backgroundImage}} />
           <div className='meta'>
             {end_time && <span><Deadline time={end_time}/> {spacer}</span>}
             {tag && <span className='hashtag-segment'><A className='hashtag' to={url}> #{tag} </A> {spacer}</span>}
             <A to={`/u/${user.id}`}>
               {user.name}
             </A>
           </div>
           <A className='title' to={url}>
             {name}
           </A>
           {!isMobile && description && <div className='details-row'>
                                          <ClickCatchingSpan className='details' dangerouslySetInnerHTML={{__html: description}} />
                                          {truncated && <span><A to={`/p/${id}`} className='show-more'> Show more </A></span>}
                                        </div>}
           <Supporters post={post} simple/>
           <div className='comments-section-spacer' />
           <CommentSection post={post} comments={comments} onExpand={() => dispatch(navigate(url))} />
         </div>
})

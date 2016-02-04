import React from 'react'
import { filter, get } from 'lodash'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { notify } from '../../actions'
import { fetchProject } from '../../actions/project'
import TagInput from '../../components/TagInput'
import {
  SEND_PROJECT_INVITE,
  typeahead,
  updateProjectInvite,
  sendProjectInvite,
  navigate
} from '../../actions'
const { object, func, array, bool } = React.PropTypes

let typeaheadId = 'invitees'

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchProject(id)))
@connect(({ typeaheadMatches, projects, people, projectInvite, pending }, { params: { id } }) => ({
  project: projects[id],
  currentUser: people.current,
  peopleChoices: typeaheadMatches[typeaheadId] || [],
  peopleChosen: get(projectInvite, id + '.peopleChosen', []),
  sending: pending[SEND_PROJECT_INVITE]
}))
export default class ProjectInvite extends React.Component {
  static propTypes = {
    project: object,
    dispatch: func,
    peopleChosen: array,
    peopleChoices: array,
    sending: bool
  }

  updateStore (data) {
    let { project: { id }, dispatch } = this.props
    dispatch(updateProjectInvite(data, id))
  }

  addPerson = person => {
    let { peopleChosen } = this.props
    this.updateStore({peopleChosen: (peopleChosen || []).concat(person)})
  }

  removePerson = person => {
    let { peopleChosen } = this.props
    this.updateStore({peopleChosen: filter(peopleChosen, pc => pc.id !== person.id)})
  }

  updatePeopleChoices = term => {
    let { dispatch } = this.props
    dispatch(typeahead(term, typeaheadId, {type: 'people'}))
  }

  submit = () => {
    let { dispatch, peopleChosen, project: { id, slug } } = this.props
    let subject = this.refs.subject.value
    let message = this.refs.message.value
    let emails = this.refs.emails.value.split(',')
    let users = peopleChosen.map(p => p.id)
    dispatch(sendProjectInvite({emails, message, subject, users}, id))
    .then(({ error }) => error || Promise.all([
      dispatch(navigate(`/project/${id}/${slug}`)),
      dispatch(notify(`Sent invitations to ${emails.length + users.length} people.`, {type: 'success'}))
    ]))
  }

  render () {
    let { project, peopleChoices, peopleChosen, sending } = this.props
    let subject = `Join my project "${project.title}" on Hylo`
    let message = `I would like your help on a project I'm starting:\n\n${project.title}\n${project.intention}\n\nYou can help make it happen!`

    return <div className='project-invite form-sections'>
      <div className='section-label'>
        Invite Contributors
      </div>
      <div className='section-item'>
        <div className='full-column'>
          <label>Subject</label>
          <input type='text' ref='subject' className='form-control' defaultValue={subject}/>
        </div>
      </div>
      <div className='section-item'>
        <div className='full-column'>
          <label>Message</label>
          <textarea className='form-control' ref='message' defaultValue={message}/>
          <span className='summary'>The message will also contain a link to the project.</span>
        </div>
      </div>
      <div className='section-item'>
        <div className='full-column'>
          <label>Search for Hylo members to invite</label>
          <TagInput tags={peopleChosen}
            choices={peopleChoices}
            handleInput={this.updatePeopleChoices}
            onSelect={this.addPerson}
            onRemove={this.removePerson}/>
        </div>
      </div>
      <div className='section-item'>
        <div className='full-column'>
          <label>Invite anyone else by email</label>
          <input type='text' ref='emails' className='form-control' placeholder='Enter email address, separated by commas...'/>
        </div>
      </div>
      <div className='section footer right-align'>
        <button type='button' onClick={this.submit} disabled={sending}>
          {sending ? 'Sending...' : 'Send invitations'}
        </button>
      </div>
    </div>
  }
}

import React from 'react'
import { filter, get } from 'lodash'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchProject } from '../../actions/project'
import { Link } from 'react-router'
import TagInput from '../../components/TagInput'
import { typeahead, updateProjectInvite } from '../../actions'
const { object, func, array } = React.PropTypes

let typeaheadId = 'invitees'

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchProject(id)))
@connect(({ typeaheadMatches, projects, people, projectInvite }, { params: { id } }) => ({
  project: projects[id],
  currentUser: people.current,
  peopleChoices: typeaheadMatches[typeaheadId] || [],
  peopleChosen: get(projectInvite, id + '.peopleChosen', [])
}))
export default class ProjectInvite extends React.Component {
  static propTypes = {
    project: object,
    dispatch: func,
    peopleChosen: array,
    peopleChoices: array
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

  render () {
    let { project, peopleChoices, peopleChosen } = this.props
    let subject = `Join my project "${project.title}" on Hylo`
    let message = `I would like your help on a project I'm starting:\n\n${project.title}\n${project.intention}\n\nYou can help make it happen!`

    return <div className='project-invite sections'>
      <div className='section-label'>
        Invite Contributors
        <Link className='close-button' to='contributors'>x</Link>
      </div>
      <div className='section-item'>
        <div className='full-column'>
          <label>Subject</label>
          <input type='text' className='form-control' defaultValue={subject}/>
        </div>
      </div>
      <div className='section-item'>
        <div className='full-column'>
          <label>Message</label>
          <textarea className='form-control' defaultValue={message}/>
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
    </div>
  }
}

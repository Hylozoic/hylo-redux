import React from 'react'
import { find } from 'lodash'
import { prefetch } from 'react-fetcher'
import { connect } from 'react-redux'
import { fetchProject } from '../../actions/project'
import { Link } from 'react-router'
// import TagInput from './TagInput'
const { object, func, array } = React.PropTypes

@prefetch(({ dispatch, params: { id } }) => dispatch(fetchProject(id)))
@connect(({ projects, people }, { params: { id } }) => ({
  project: projects[id],
  currentUser: people.current
}))
export default class ProjectContributors extends React.Component {
  static propTypes = {
    project: object,
    dispatch: func,
    people: array
  }

  addCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: (communities || []).concat(community.id)})
  }

  removeCommunity = community => {
    let { communities } = this.props.postEdit
    this.updateStore({communities: filter(communities, cid => cid !== community.id)})
  }

  render () {
    let { project, people } = this.props
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
          <PersonTagInput ids={people}
            getChoices={this.findPeople}
            onSelect={this.addPeople}
            onRemove={this.removePeople}/>
        </div>
      </div>
    </div>
  }
}
/*
@connect(({ people }, { ids }) => ({
  people: (ids || []).map(id => find(people, c => c.id === id))
}))
class PersonTagInput extends React.Component {
  static propTypes = {
    ids: array,
    people: array
  }

  render () {
    let { people, ...otherProps } = this.props
    return <TagInput tags={people} {...otherProps}/>
  }
}
*/

require('../support')
import { mocks, helpers } from '../../support'
import { cloneDeep, set } from 'lodash'
import moment from 'moment'
import ProjectPostEditor from '../../../src/components/ProjectPostEditor'
import {
  findRenderedDOMComponentWithClass,
  renderIntoDocument
} from 'react-addons-test-utils'
const { createElement } = helpers
const currentUser = {id: 'person'}

const postEdit = {
  requests: [],
  foo: {
    expanded: true,
    name: 'hello!',
    description: 'and welcome',
    communities: ['f']
  },
  financialRequestsEnabled: false
}

const state = {
  pending: {},
  typeaheadMatches: {},
  currentCommunityId: 'f',
  communities: {
    f: {
      id: 'f',
      name: 'Foo Community',
      settings: {
        enable_finance: false
      }
    }
  },
  people: {
    current: { id: 'id', linkedAccounts: [] }
  }
}

const post = {id: 'foo'}
let component, node, store

const render = (state, post, postEdit, storeSetupCallback) => {
  store = mocks.redux.store(state)
  if (storeSetupCallback) storeSetupCallback(store)
  const context = {store, dispatch: store.dispatch, currentUser}
  component = createElement(ProjectPostEditor, { post, postEdit, update: () => {} }, context)
  node = renderIntoDocument(component).getWrappedInstance()
}

describe('ProjectPostEditor', () => {
  beforeEach(() => {
    window.alert = spy(window.alert)
    render(state, post, postEdit)
  })

  afterEach(() => {
    window.alert = window._originalAlert
  })

  describe('financial request not enabled and community financially disabled', () => {
    it('should hide financial request section in project post editor', () => {
      let projectPostEditor = findRenderedDOMComponentWithClass(node, 'form-sections')
      expect(projectPostEditor.getElementsByClassName('financial-request').length).to.equal(0)
    })
  })

  describe('financial request enabled and community financially disabled', () => {
    beforeEach(() => {
      const newState = cloneDeep(state)
      set(newState, 'communities.f.financial_requests_enabled', false)

      const newPostEdit = cloneDeep(postEdit)
      set(newPostEdit, 'financialRequestsEnabled', true)

      render(newState, post, newPostEdit)
    })

    it('shows financial request section on project post editor', () => {
      let projectPostEditor = findRenderedDOMComponentWithClass(node, 'project-editor form-sections')

      expect(projectPostEditor.getElementsByClassName('financial-request').length).to.equal(1)
    })
  })


    describe('there is a non-financial project', () => {
      let newState, newPostEdit

      beforeEach(() => {
        newState  = cloneDeep(state)
        newPostEdit = cloneDeep(postEdit)
      })

      it('deadline should be blank when deadline is not given', () => {
        render(newState, post, newPostEdit)
        let deadline = findRenderedDOMComponentWithClass(node, 'deadline-date-picker')
        expect(deadline.value).to.equal(undefined)
      })

      it('there is a deadline when deadline is given', () => {
        set(newPostEdit, 'end_time', '2080-08-24T14:00:00.000Z')
        render(newState, post, newPostEdit)
        let deadline = findRenderedDOMComponentWithClass(node, 'end_time')
        expect(deadline.value).to.equal(moment('2080-08-24T14:00:00.000Z').format("MM/DD/YYYY hh:mm A"))
      })
    })
})

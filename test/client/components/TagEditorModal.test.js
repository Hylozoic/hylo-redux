require('../support')
import React from 'react'
import { mount } from 'enzyme'
import { configureStore } from '../../../src/store'
import TagEditorModal from '../../../src/containers/TagEditorModal'
import { MemberRole } from '../../../src/models/community'
import { wait } from '../../support/helpers'

describe('TagEditorModal', () => {
  var node, store, currentUser

  const community = {
    id: '1',
    slug: 'coo',
    name: 'Coomunity'
  }

  const initialState = {
    communities: {
      coo: community
    },
    currentCommunityId: '1'
  }

  describe('with moderator', () => {
    beforeEach(() => {
      currentUser = {
        memberships: [
          {...community, community_id: '1', role: MemberRole.MODERATOR}
        ]
      }
    })

    describe('with creating set', () => {
      var alertMessage, useCreatedTag

      beforeEach(() => {
        useCreatedTag = spy(() => {})
        store = configureStore(initialState).store
        node = mount(<TagEditorModal creating useCreatedTag={useCreatedTag}/>, {
          context: { store, currentUser },
          childContextTypes: {currentUser: React.PropTypes.object}
        })
        window.oldAlert = window.alert
        window.alert = message => alertMessage = message
      })

      afterEach(() => {
        window.alert = window.oldAlert
      })

      it('renders correctly', () => {
        expect(node.find('.title h2').first().text())
        .to.equal("Hey, you're creating a new topic.")
        expect(node.find('label').map(l => l.text()))
        .to.deep.equal(['Topic name', 'Description', 'Make default'])
        expect(node.find('.modal-input').length).to.equal(3)
      })

      it('validates tags', () => {
        const submit = node.find('.footer button').first()

        submit.simulate('click')
        expect(alertMessage).to.equal('Topic names must be at least 2 characters.')
        const input = node.find('input[type="text"]').first()

        input.simulate('change', {
          target: {value: '99bottles'}
        })
        return wait(300, () => {
          submit.simulate('click')
          expect(alertMessage).to.equal('Topic names must start with a letter.')

          input.simulate('change', {
            target: {value: 'spaces between'}
          })
          return wait(300, () => {
            submit.simulate('click')
            expect(alertMessage)
            .to.equal('Topic names can only use letters, numbers and underscores, with no spaces.')

            input.simulate('change', {
              target: {value: 'agood_Tagname23'}
            })
            return wait(300, () => {
              submit.simulate('click')
              expect(useCreatedTag).to.have.been.called.with({
                agood_Tagname23: {
                  description: '',
                  is_default: false
                }
              })
            })
          })
        })
      })
    })

    describe('with one tag to edit', () => {
      beforeEach(() => {
        store = configureStore({
          ...initialState,
          tagDescriptionEdits: {
            newtag: {description: '', is_default: false}
          }
        }).store
        node = mount(<TagEditorModal/>, {
          context: { store, currentUser },
          childContextTypes: {currentUser: React.PropTypes.object}
        })
      })

      it('renders correctly', () => {
        expect(node.find('.title h2').first().text())
        .to.equal("Hey, you're creating a new topic.")
        expect(node.find('.topic span').first().text()).to.equal('#newtag')
        expect(node.find('label').map(l => l.text()))
        .to.deep.equal(['Topic name', 'Description', 'Make default'])
        expect(node.find('.modal-input').length).to.equal(2)
      })
    })

    describe('with two tags to edit', () => {
      beforeEach(() => {
        store = configureStore({
          ...initialState,
          tagDescriptionEdits: {
            newtag: {description: '', is_default: false},
            twotag: {description: '', is_default: false}
          }
        }).store
        node = mount(<TagEditorModal/>, {
          context: { store, currentUser },
          childContextTypes: {currentUser: React.PropTypes.object}
        })
      })

      it('renders correctly', () => {
        expect(node.find('.title h2').first().text())
        .to.equal("Hey, you're creating new topics.")
        expect(node.find('.topic span').first().text()).to.equal('#newtag')
        expect(node.find('.topic span').at(1).text()).to.equal('#twotag')
        expect(node.find('label').map(l => l.text()))
        .to.deep.equal(['Topic name', 'Description', 'Make default', 'Topic name', 'Description', 'Make default'])
        expect(node.find('.modal-input').length).to.equal(4)
      })
    })
  })

  describe('with non-moderator', () => {
    beforeEach(() => {
      currentUser = {
        memberships: [
          {...community, community_id: '1'}
        ]
      }
      store = configureStore(initialState).store
      node = mount(<TagEditorModal creating/>, {
        context: { store, currentUser },
        childContextTypes: {currentUser: React.PropTypes.object}
      })
    })

    it('renders correctly, omitting Make default', () => {
      expect(node.find('.title h2').first().text())
      .to.equal("Hey, you're creating a new topic.")
      expect(node.find('label').map(l => l.text()))
      .to.deep.equal(['Topic name', 'Description'])
      expect(node.find('.modal-input').length).to.equal(2)
    })
  })
})

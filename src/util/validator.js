import { isEmpty } from 'lodash'

export const validateForm = component => {
    let { postEdit } = component.props
    const { title, subeditor } = component.refs

    if (!postEdit.name) {
        window.alert('The title of a post cannot be blank.')
        title.focus()
        return Promise.resolve(false)
    }

    if (isEmpty(postEdit.communities)) {
        window.alert('Please pick at least one community.')
        return Promise.resolve(false)
    }

    if (postEdit.financialRequestsEnabled &&
        (!postEdit.financialRequestAmount || parseFloat(postEdit.financialRequestAmount) === 0.00)) {
        window.alert('Enter an amount for financial contributions.')
        return Promise.resolve(false)
    }

    if (postEdit.end_time && new Date(postEdit.end_time).getTime() < new Date().getTime()) {
        window.alert('Deadline must have not yet passed.')
        return Promise.resolve(false)
    }

    if (parseFloat(postEdit.financialRequestAmount) > 100000) {
        window.alert('Please enter an amount less than $100000.')
        return Promise.resolve(false)
    }

    if (postEdit.financialRequestsEnabled && !postEdit.end_time) {
        window.alert('Enter a project deadline.')
        return Promise.resolve(false)
    }

    if (subeditor) {
        const subvalidate = subeditor.validate || subeditor.getWrappedInstance().validate
        return Promise.resolve(subvalidate())
    }

    return Promise.resolve(true)
}

export const validatePledge = pledgeAmount => {
    if(pledgeAmount && parseFloat(pledgeAmount) > 5000.00) {
        window.alert('Pledge amount must be less than $5000.')
        return Promise.resolve(false)
    }

    if(pledgeAmount && pledgeAmount === '0.00') {
        window.alert('Pledge amount can not be $0.')
        return Promise.resolve(false)
    }

    return Promise.resolve(true)
}

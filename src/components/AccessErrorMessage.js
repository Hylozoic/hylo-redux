import React from 'react'
const { object } = React.PropTypes

const AccessErrorMessage = ({ error }) => {
  let errorMessage
  switch (error.status) {
    case 403:
      errorMessage = "You don't have permission to view this page."
      break
    case 404:
      errorMessage = 'Page not found.'
      break
    default:
      errorMessage = 'An error occurred.'
  }
  return <div className='alert alert-danger access-error-message'>
    {errorMessage}
    <span> </span>
    <a href='javascript:history.go(-1)'>Back</a>
  </div>
}

AccessErrorMessage.propTypes = {
  error: object.isRequired
}

export default AccessErrorMessage

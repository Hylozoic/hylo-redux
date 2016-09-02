import React from 'react'
import { Link } from 'react-router'

class PromptBecomeEconomicAgent extends React.Component {

  constructor(props) {
    super(props)
  }

  render () {
    const { thing } = this.props
    const promptText = "Please connect your financial account to pledge funds to projects. You can do this in the Payment Details section of your "
    const accountSettings = "Account Settings"
    return(
      <div className='prompt-become-economic-agent'>
        {promptText}
        <Link className='account-settings-link' to='/settings'>
          {accountSettings}
        </Link>
      </div>
    )
  }
}

export default PromptBecomeEconomicAgent

import React from 'react'

class PromptBecomeEconomicAgent extends React.Component {

  constructor(props) {
    super(props)
  }

  render () {
    const { thing } = this.props

    return(
      <div className='prompt-become-economic-agent'>Connect your account</div>
    )
  }
}

export default PromptBecomeEconomicAgent

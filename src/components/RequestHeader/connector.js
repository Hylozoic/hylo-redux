import { connect } from 'react-redux'
import { reject } from 'lodash'
import {
  completePost,
  typeahead
} from '../../actions'

export function mapStateToProps (state, {post}) {
  return {
    contributorChoices: reject(
      state.typeaheadMatches.contributors, {id: post.user_id}
    )
  }
}

export const mapDispatchToProps = {
  completePost,
  typeahead
}

export default connect(mapStateToProps, mapDispatchToProps)

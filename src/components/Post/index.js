// LEJ: This file should always the same, even in the case of a pre-fetch
//      that should happen in the connector along with the connect.
import component from './component'
import connector from './connector'
export default connector(component)

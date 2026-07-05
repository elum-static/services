import Store from "../../utils/Store"
import core from "src/core"

type SeasonInfoStore = {}

class SeasonInfo extends Store<SeasonInfoStore> {
  constructor() {
    super({}, () => core.api.season.info())
  }

  // get items() {
  //   this.getData()
  //   return this.data.items
  // }
}

export default SeasonInfo

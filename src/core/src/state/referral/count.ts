import Store from "../../../utils/Store"
import core from "src/core"

type SeasonInfoStore = {
  count: number
}

class ReferralCount extends Store<SeasonInfoStore> {
  constructor() {
    super({ count: 0 }, () => core.api.referral.count())
  }

  get count() {
    this.getData()
    return this.data.count
  }
}

export default ReferralCount

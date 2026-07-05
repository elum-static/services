import Store from "../../../utils/Store"
import core from "src/core"

type SeasonInfoStore = {
  item_key: string
  amount: number
}

class ReferralEarned extends Store<SeasonInfoStore> {
  constructor() {
    super({ item_key: "coin", amount: 0 }, () => core.api.referral.earned())
  }

  get item_key() {
    this.getData()
    return this.data.item_key
  }

  get amount() {
    this.getData()
    return this.data.amount
  }
}

export default ReferralEarned

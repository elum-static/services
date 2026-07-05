import Store from "../../../utils/Store"
import core from "src/core"

type SeasonInfoStore = {
  item_key: string
  user_amount: number
  owner_amount: number
}

class ReferralReward extends Store<SeasonInfoStore> {
  constructor() {
    super({ item_key: "", user_amount: 2, owner_amount: 0 }, () => core.api.referral.reward())
  }

  get item_key() {
    this.getData()
    return this.data.item_key
  }

  get user_amount() {
    this.getData()
    return this.data.user_amount
  }

  get owner_amount() {
    this.getData()
    return this.data.owner_amount
  }
}

export default ReferralReward

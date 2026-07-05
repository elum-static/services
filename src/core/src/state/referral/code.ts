import Store from "../../../utils/Store"
import core from "src/core"

type SeasonInfoStore = {
  code: string
}

class ReferralCode extends Store<SeasonInfoStore> {
  constructor() {
    super({ code: "" }, () => core.api.referral.code())
  }

  get code() {
    this.getData()
    return this.data.code
  }
}

export default ReferralCode

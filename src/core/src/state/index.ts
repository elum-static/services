import User from "./user"

import SeasonInfo from "./season_info"
import SeasonLeaders from "./season_leaders"

import ReferralCode from "./referral/code"
import ReferralCount from "./referral/count"
import ReferralEarned from "./referral/eared"
import ReferralReward from "./referral/reward"
import Balance from "./balance"
import TaskList from "./task_list"
import TaskPartnerList from "./task_partner_list"

class State {
  constructor() {}

  public user = new User()
  public balance = new Balance()
  public season_info = new SeasonInfo()
  public season_leaders = new SeasonLeaders()

  // Referral
  public referral_reward = new ReferralReward()
  public referral_count = new ReferralCount()
  public referral_earned = new ReferralEarned()
  public referral_code = new ReferralCode()
  public task_list = new TaskList()
  public task_partner_list = new TaskPartnerList()
}

export default State

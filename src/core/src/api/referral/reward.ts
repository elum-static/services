import network from "../module"

type Response = {
  item_key: string
  user_amount: number
  owner_amount: number
}

// FIXME: Ключи называются по другому
async function referralReward() {
  return network.send<Response>("referral.reward", {})
}

export default referralReward

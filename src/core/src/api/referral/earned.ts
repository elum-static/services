import network from "../module"

type Response = {
  item_key: string
  amount: number
}

// FIXME: Ключи называются по другому
async function referralEarned() {
  return network.send<Response>("referral.earned", {})
}

export default referralEarned

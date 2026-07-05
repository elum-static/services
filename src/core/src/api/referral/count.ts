import network from "../module"

type Response = {
  count: number
}

// FIXME: Ключи называются по другому
async function referralCount() {
  return network.send<Response>("referral.count", {})
}

export default referralCount

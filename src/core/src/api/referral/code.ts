import network from "../module"

type Response = {
  code: string
}

// FIXME: Ключи называются по другому
async function referralCode() {
  return network.send<Response>("referral.code", {})
}

export default referralCode

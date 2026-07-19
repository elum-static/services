import network from "../module"

type Response = Record<string, unknown>

type Options = {
  issue_ref: string
  variables?: Record<string, unknown>
}

function taskPartnerCheck(options: Options) {
  return network.send<Response>("task.partnerCheck", options)
}

export default taskPartnerCheck

import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
}

async function cpaStatus(options: Options) {
  return network.send<Response>("cpa.status", options)
}

export default cpaStatus

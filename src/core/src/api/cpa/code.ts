import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
}

async function cpaCode(options: Options) {
  return network.send<Response>("cpa.code", options)
}

export default cpaCode

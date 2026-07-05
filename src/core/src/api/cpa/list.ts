import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  locale?: string
}

async function cpaList(options: Options) {
  return network.send<Response>("cpa.list", options)
}

export default cpaList

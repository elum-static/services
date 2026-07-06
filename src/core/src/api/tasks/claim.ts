import network from "../module"

// FIXME: unknown
type Response = {}

type Options = {
  id: string
  operation_id: string
}

async function taskClaim(options: Options) {
  return network.send<Response>("task.claim", options)
}

export default taskClaim

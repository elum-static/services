import network from "../module"

type Response = Record<string, unknown>

type Options = {
  key: string
  provider?: string
  variables?: Record<string, string>
}

function taskCheck(options: Options) {
  return network.send<Response>("task.check", options)
}

export default taskCheck

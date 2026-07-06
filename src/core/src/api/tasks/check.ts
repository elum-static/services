import network from "../module"

export type Response = {
  completed: boolean
  reason?: string
  record?: unknown
}

type Options = {
  key: string
}

async function taskCheck(options: Options) {
  return network.send<Response>("task.check", options)
}

export default taskCheck

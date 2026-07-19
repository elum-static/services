import network from "../module"

type Response = {
  started?: boolean
  action_url?: string
  status?: string
}

type Options = {
  task_ref: string
}

function taskStart(options: Options) {
  return network.send<Response>("task.start", options)
}

export default taskStart

import network from "../module"
import type { TaskItem } from "./list"

export type Response = {
  completed?: boolean
  status?: string
  task?: TaskItem
}

type Options = {
  issue_ref: string
  variables?: Record<string, string>
}

async function taskPartnerCheck(options: Options) {
  return network.send<Response>("task.partnerCheck", options)
}

export default taskPartnerCheck

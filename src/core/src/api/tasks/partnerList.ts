import network from "../module"
import type { TaskItem } from "./list"

export type Response = TaskItem[]

type Options = {
  provider: string
  group_key: string
  platform: string
  locale?: string
  limit?: number
  variables?: Record<string, string>
}

async function taskPartnerList(options: Options) {
  return network.send<Response>("tasks.partnerList", options)
}

export default taskPartnerList

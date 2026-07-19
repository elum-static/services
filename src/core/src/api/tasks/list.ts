import network from "../module"

import * as rtl from "@minsize/rtl"
import { schemaTask } from "./types"

const schemaResponse = rtl.array(
  rtl.object({
    key: rtl.string(),
    title: rtl.string(),
    description: rtl.optional(rtl.string()),
    tasks: rtl.array(schemaTask),
  }),
)

export type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  locale?: string
  group_key?: string
}

async function taskList(options: Options) {
  options.locale = "en"
  return network.send<Response>("task.list", options, { schema: schemaResponse })
}

export default taskList

import network from "../../module"

import * as rtl from "@minsize/rtl"

export const schemaResponse = rtl.object({
  left: rtl.boolean(),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {}

async function crushLeave(options: Options) {
  return network.send<Response>("game.crushLeave", options, { schema: schemaResponse })
}

export default crushLeave

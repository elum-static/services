import network from "../../module"

import * as rtl from "@minsize/rtl"

const schemaResponse = rtl.object({
  left: rtl.boolean(),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {}

async function pvpLeave(options: Options) {
  return network.send<Response>("game.pvpLeave", options, { schema: schemaResponse })
}

export default pvpLeave

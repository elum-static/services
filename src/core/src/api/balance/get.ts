import network from "../module"

import * as rtl from "@minsize/rtl"

const schemaResponse = rtl.object({
  stars: rtl.integer(),
  bonus_stars: rtl.integer(),
  lightning: rtl.integer(),
})

type Response = rtl.InferOutput<typeof schemaResponse>

async function balanceGet() {
  return network.send<Response>("balance.get", {}, { schema: schemaResponse })
}

export default balanceGet

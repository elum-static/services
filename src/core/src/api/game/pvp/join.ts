import network from "../../module"

import * as rtl from "@minsize/rtl"

const schemaResponse = rtl.object({
  // game: schemaGameMinesGame,
  // real_balance_after: rtl.integer(),
  // bonus_balance_after: rtl.integer(),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {}

async function pvpJoin(options: Options) {
  return network.send<Response>("game.pvpJoin", options, { schema: schemaResponse })
}

export default pvpJoin

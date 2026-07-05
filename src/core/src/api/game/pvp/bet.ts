import network from "../../module"

import * as rtl from "@minsize/rtl"
import { schemaGamePvpBet, schemaGamePvpRound } from "./types"

const schemaResponse = rtl.object({
  round: schemaGamePvpRound,
  bet: schemaGamePvpBet,
  real_balance_after: rtl.integer(),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  /**
   *  ключ идемпотентности, чтобы повтор запроса не создал дубль.
   */
  request_key: string
  /**
   * размер ставки в звездах.
   */
  amount: number
}

async function pvpBet(options: Options) {
  return network.send<Response>("game.pvpBet", options, { schema: schemaResponse })
}

export default pvpBet

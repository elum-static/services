import network from "../../module"

import { schemaResponse as schemaJoinResponse } from "./join"

import * as rtl from "@minsize/rtl"
import { schemaGameCrushBet } from "./types"

export const schemaResponse = rtl.object({
  round: schemaJoinResponse,
  bet: schemaGameCrushBet,
  real_balance_after: rtl.integer(),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  /**
   * ID ставки, который был получен из game.crushBet.
   */
  entry_id: number
  /**
   *  ключ идемпотентности, чтобы повтор запроса не создал дубль.
   */
  request_key: string
}

/**
 * Забирает выигрыш по ставке во время фазы `FLYING`
 */
async function crushCashOut(options: Options) {
  return network.send<Response>("game.crushCashOut", options, { schema: schemaResponse })
}

export default crushCashOut

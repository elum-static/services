import core from "src/core"

import { schemaResponse as schemaJoinResponse } from "./join"
import network from "../../module"

import * as rtl from "@minsize/rtl"
import { schemaGameCrushBet } from "./types"

export const schemaResponse = rtl.object({
  round: schemaJoinResponse,
  bet: schemaGameCrushBet,
  real_balance_after: rtl.integer(),
  bonus_balance_after: rtl.integer(),
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

  /**
   * необязательный авто cash out в basis points. 15000 = x1.5, 20000 = x2.
   */
  auto_cash_out_bp?: number
}

/**
 * Ставит ставку только при статусе `BETTING`
 */
async function crushBet(options: Options) {
  try {
    return network.send<Response>("game.crushBet", options, { schema: schemaResponse })
  } finally {
    // Обновляем балансы
    core.state.balance.refresh()
  }
}

export default crushBet

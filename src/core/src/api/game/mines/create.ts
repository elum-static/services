import core from "src/core"

import network from "../../module"
import { schemaGameMinesGame, type GameMinesGame } from "./types"

import * as rtl from "@minsize/rtl"

const schemaResponse = rtl.object({
  game: schemaGameMinesGame,

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
   * количество мин. Фактический диапазон движка: 3..24
   */
  mines: number
}

async function minesCreate(options: Options) {
  try {
    return network.send<Response>("game.minesCreate", options, { schema: schemaResponse })
  } finally {
    // Обновляем балансы
    core.state.balance.refresh()
  }
}

export default minesCreate

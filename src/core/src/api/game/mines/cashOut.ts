import core from "src/core"
import network from "../../module"

import { GameMinesGame } from "./types"

// FIXME: unknown
type Response = {
  game: GameMinesGame
  real_balance_after: number
}

type Options = {
  /**
   *  ключ идемпотентности, чтобы повтор запроса не создал дубль.
   */
  request_key: string

  /**
   * ID игры.
   */
  game_id: number
}

/**
 * Забирает выигрыш по ставке во время фазы `FLYING`
 */
async function minesCashOut(options: Options) {
  try {
    return network.send<Response>("game.minesCashOut", options)
  } finally {
    // Обновляем балансы
    core.state.balance.refresh()
  }
}

export default minesCashOut

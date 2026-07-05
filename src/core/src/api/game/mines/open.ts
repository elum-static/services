import core from "src/core"

import network from "../../module"
import { schemaGameMinesGame } from "./types"

import * as rtl from "@minsize/rtl"

const schemaResponse = schemaGameMinesGame

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  /**
   *  ключ идемпотентности, чтобы повтор запроса не создал дубль.
   */
  request_key: string
  game_id: number
  cell: number
}

async function minesOpen(options: Options) {
  return network.send<Response>("game.minesOpen", options, { schema: schemaGameMinesGame })
}

export default minesOpen

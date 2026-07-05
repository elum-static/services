import core from "src/core"

import network from "../../module"
import { schemaGameMinesGame } from "./types"

import * as rtl from "@minsize/rtl"

const schemaResponse = schemaGameMinesGame

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  game_id: number
}

async function minesState(options: Options) {
  return network.send<Response>("game.minesState", options, { schema: schemaResponse })
}

export default minesState

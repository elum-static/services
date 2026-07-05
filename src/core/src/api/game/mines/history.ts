import network from "../../module"

import { schemaGameMinesGame } from "./types"
import * as rtl from "@minsize/rtl"

const schemaResponse = rtl.object({
  items: rtl.array(schemaGameMinesGame),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {
  limit?: number
}

async function minesHistory(options: Options) {
  return network.send<Response>("game.minesHistory", options, { schema: schemaResponse })
}

export default minesHistory

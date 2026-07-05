import network from "../../module"

import * as rtl from "@minsize/rtl"
import { schemaGamePvpRound } from "./types"

const schemaResponse = schemaGamePvpRound

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {}

async function pvpState(options: Options) {
  return network.send<Response>("game.pvpState", options, { schema: schemaResponse })
}

export default pvpState

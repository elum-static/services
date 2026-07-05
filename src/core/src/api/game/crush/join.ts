import network from "../../module"
import { GameCrushPhase, schemaGameCrushBet } from "./types"

import * as rtl from "@minsize/rtl"

export const schemaResponse = rtl.object({
  session_id: rtl.integer(),
  phase: rtl.enum(GameCrushPhase),
  multiplier: rtl.integer(),
  betting_ends_at: rtl.date(),
  bets: rtl.array(schemaGameCrushBet),
  previous_multipliers: rtl.array(rtl.number()),
})

type Response = rtl.InferOutput<typeof schemaResponse>

type Options = {}

async function crushJoin(options: Options) {
  return network.send<Response>("game.crushJoin", options, { schema: schemaResponse })
}

export default crushJoin

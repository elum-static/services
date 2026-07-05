import * as rtl from "@minsize/rtl"

export const schemaGameMinesGame = rtl.object({
  game_id: rtl.integer(),
  entry_id: rtl.integer(),
  mines: rtl.integer(),
  opened: rtl.array(rtl.integer()),
  multiplier: rtl.integer(),
  potential_payout: rtl.integer(),
  status: rtl.enum(["ACTIVE", "LOST", "IDLE", "CASHED_OUT"] as const),
  expires_at: rtl.date(),
  map: rtl.optional(rtl.array(rtl.integer())),
})

export type GameMinesGame = rtl.InferOutput<typeof schemaGameMinesGame>

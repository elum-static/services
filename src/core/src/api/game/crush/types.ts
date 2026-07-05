import * as rtl from "@minsize/rtl"

export enum GameCrushPhase {
  IDLE = "IDLE",
  BETTING = "BETTING",
  FLYING = "FLYING",
  CRASHED = "CRASHED",
}

export const schemaGameCrushBet = rtl.object({
  entry_id: rtl.integer(),
  user: rtl.object({
    id: rtl.integer(),
    is_premium: rtl.boolean(),
    photo_url: rtl.optional(rtl.string()),
    first_name: rtl.string(),
    last_name: rtl.optional(rtl.string()),
    user_name: rtl.optional(rtl.string()),
  }),
  /**
   * сумма ставки в звездах без детализации обычных/бонусных звезд.
   */
  amount: rtl.integer(),
  /**
   * статус ставки: обычно ACTIVE, LOST, PAID.
   *
   * FIMEX: WHAT - ACTIVE - нет таког ополя
   */
  status: rtl.enum(["ACTIVE", "LOST", "PAID", "PLACED"]),
  /**
   * true, если игрок уже вывел ставку.
   */
  cashed_out: rtl.optional(rtl.boolean()),
  /**
   * множитель вывода. Есть только после успешного вывода.
   */
  cash_out_multiplier: rtl.optional(rtl.boolean()),
  /**
   * выплата. Есть только после успешного вывода.
   */
  payout_amount: rtl.optional(rtl.number()),
  /**
   * прибыль. Есть только после успешного вывода.
   */
  profit_amount: rtl.optional(rtl.number()),
})

export type GameCrushBet = rtl.InferOutput<typeof schemaGameCrushBet>

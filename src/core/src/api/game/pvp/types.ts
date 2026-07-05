import * as rtl from "@minsize/rtl"

export const schemaGamePvpBet = rtl.object({
  /**
   * последняя stake-запись пользователя в текущем раунде.
   */
  entry_id: rtl.integer(),
  /**
   * публичные данные пользователя.
   */
  user: rtl.object({
    id: rtl.integer(),
    is_premium: rtl.boolean(),
    photo_url: rtl.optional(rtl.url()),
    first_name: rtl.string(),
    last_name: rtl.optional(rtl.string()),
    user_name: rtl.optional(rtl.string()),
  }),
  /**
   * общая сумма ставок пользователя в этом раунде.
   */
  amount: rtl.integer(),
  /**
   * текущий шанс победы в scale 100 = 1.00%.
   */
  chance: rtl.integer(),
  status: rtl.enum(["PLACED", "PAID", "LOST", "REFUNDED"] as const),
  /**
   * выплата победителя. Приходит после результата.
   */
  payout_amount: rtl.optional(rtl.integer()),
  /**
   * выплата минус собственная суммарная ставка победителя.
   */
  profit_amount: rtl.optional(rtl.integer()),
})

export const schemaGamePvpRound = rtl.object({
  /**
   * внутренний ID текущего раунда.
   */
  session_id: rtl.integer(),
  /**
   * текущая фаза.
   */
  phase: rtl.enum(["IDLE", "BETTING", "RESOLVING", "RESOLVED"] as const),
  /**
   * UTC-время закрытия ставок.
   */
  betting_ends_at: rtl.date(),
  /**
   * сумма всех ставок текущего раунда.
   */
  total_amount: rtl.integer(),
  /**
   * комиссия платформы в scale 100 = 1.00%.
   */
  fee: rtl.integer(),
  /**
   * победивший игрок, приходит только после результата.
   */
  winner: rtl.optional(rtl.unknown()),
  /**
   * сумма комиссии платформы.
   */
  fee_amount: rtl.optional(rtl.integer()),
  /**
   * сумма выплаты победителю.
   */
  payout_amount: rtl.optional(rtl.integer()),
  /**
   * публичные агрегированные ставки пользователей.
   */
  bets: rtl.array(schemaGamePvpBet),
})

export type GameMinesGame = rtl.InferOutput<typeof schemaGamePvpRound>

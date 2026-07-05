import { error } from "node:console"
import { GameCrushBet, GameCrushPhase, schemaGameCrushBet } from "../game/crush/types"

import * as rtl from "@minsize/rtl"
import { schemaGamePvpBet, schemaGamePvpRound } from "../game/pvp/types"

export type FetchResponse<R> =
  | {
      response: R
      error?: undefined
    }
  | {
      response?: undefined
      error: {
        code: string
      }
    }

export const schemaFetchResponse = <OUTPUT, INPUT = OUTPUT>(value: rtl.Schema<INPUT, OUTPUT>) => {
  return rtl.union(
    rtl.object({
      response: value,
      error: rtl.optional(rtl.literal(undefined)),
    }),
    rtl.object({
      response: rtl.optional(rtl.literal(undefined)),
      error: rtl.object({
        code: rtl.string(),
      }),
    }),
  )
}

export const schemaEmitterNetwork = {
  /**
   * Сообщает об переподключение, и в некоторых местах нужно выполнить запросы заново
   */
  reconnect: rtl.array(rtl.any()),

  /**
   * Сообщает об создании переподключения
   */
  reconnecting: rtl.array(rtl.any()),
  /**
   * Сообщает от отключении от сессии по любой из причин:
   * `duplicate` - пока не подключен
   * `network` - нет подключения к интернету
   */
  disconnect: rtl.array(rtl.any()),

  /**
   * Авторизация
   */
  auth: rtl.array(
    schemaFetchResponse(
      rtl.object({
        user: rtl.object({
          id: rtl.integer(),
          app_id: rtl.integer(),
          platform: rtl.integer(),
          platform_id: rtl.integer(),
          access_level: rtl.integer(),
          is_premium: rtl.boolean(),
          language: rtl.string(),
          photo_url: rtl.optional(rtl.string()),
          first_name: rtl.string(),
          last_name: rtl.optional(rtl.string()),
          user_name: rtl.optional(rtl.string()),
          is_new: rtl.boolean(),
        }),
      }),
    ),
  ),
  /**
   * Системный ping
   */
  "system.ping": rtl.array(rtl.any()),

  /**
   * Остальные события
   */
  "game.crushBettingStarted": rtl.array(
    schemaFetchResponse(
      rtl.object({
        session_id: rtl.integer(),
        phase: rtl.enum(GameCrushPhase),
        multiplier: rtl.integer(),
        betting_ends_at: rtl.date(),
        bets: rtl.array(schemaGameCrushBet),
      }),
    ),
  ),
  "game.crushStarted": rtl.array(
    schemaFetchResponse(
      rtl.object({
        session_id: rtl.integer(),
        phase: rtl.enum(GameCrushPhase),
        multiplier: rtl.integer(),
        betting_ends_at: rtl.date(),
        bets: rtl.array(schemaGameCrushBet),
      }),
    ),
  ),
  "game.crushTick": rtl.array(
    schemaFetchResponse(
      rtl.object({
        session_id: rtl.integer(),
        phase: rtl.enum(GameCrushPhase),
        multiplier: rtl.integer(),
        betting_ends_at: rtl.date(),
        bets: rtl.array(schemaGameCrushBet),
        server_time: rtl.date(),
      }),
    ),
  ),
  "game.crushCrashed": rtl.array(
    schemaFetchResponse(
      rtl.object({
        session_id: rtl.integer(),
        phase: rtl.enum(GameCrushPhase),
        multiplier: rtl.integer(),
        betting_ends_at: rtl.date(),
        bets: rtl.array(schemaGameCrushBet),
        previous_multipliers: rtl.array(rtl.integer()),
      }),
    ),
  ),
  "game.crushBetPlaced": rtl.array(
    schemaFetchResponse(
      rtl.object({
        round: rtl.object({
          session_id: rtl.integer(),
          phase: rtl.enum(GameCrushPhase),
          multiplier: rtl.integer(),
          betting_ends_at: rtl.date(),
          bets: rtl.array(schemaGameCrushBet),
        }),
        bet: schemaGameCrushBet,
      }),
    ),
  ),
  "game.crushCashOut": rtl.array(
    schemaFetchResponse(
      rtl.object({
        round: rtl.object({
          session_id: rtl.integer(),
          phase: rtl.enum(GameCrushPhase),
          multiplier: rtl.integer(),
          betting_ends_at: rtl.date(),
          bets: rtl.array(schemaGameCrushBet),
        }),
        bet: schemaGameCrushBet,
      }),
    ),
  ),

  /**
   *  game pvp
   */
  "game.pvpBettingStarted": rtl.array(schemaFetchResponse(schemaGamePvpRound)),
  "game.pvpBetPlaced": rtl.array(
    schemaFetchResponse(
      rtl.object({
        round: schemaGamePvpRound,
        bet: schemaGamePvpBet,
      }),
    ),
  ),
  "game.pvpResolving": rtl.array(schemaFetchResponse(schemaGamePvpRound)),
  "game.pvpResolved": rtl.array(
    schemaFetchResponse(
      rtl.object({
        round: schemaGamePvpRound,
        winner: schemaGamePvpBet,
        fee_amount: rtl.integer(),
        payout_amount: rtl.integer(),
        real_balance_after: rtl.integer(),
      }),
    ),
  ),
  "game.pvpCancelled": rtl.array(schemaFetchResponse(schemaGamePvpRound)),
}

const test = rtl.object(schemaEmitterNetwork)

export type EmitterNetwork = rtl.InferOutput<typeof test>

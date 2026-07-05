import { produce } from "solid-js/store"
import Store from "src/core/utils/Store"

export type RouletteStatus = "idle" | "joined" | "countdown" | "spinning" | "ended"

export type RouletteBet = {
  user_id: number
  amount: number
}

export type RouletteGamePayload = {
  bets: RouletteBet[]
  ends_at: Date | string | null
}

export type RouletteUpdatePayload = {
  bets?: RouletteBet[]
  ends_at?: Date | string | null
}

export type RouletteEndPayload = {
  winner_user_id: number
}

type RouletteStore = {
  status: RouletteStatus
  bets: RouletteBet[]
  ends_at: Date | null
  winner_user_id: number | null
  joined: boolean
}

const defaultStore: RouletteStore = {
  status: "idle",
  bets: [],
  ends_at: null,
  winner_user_id: null,
  joined: false,
}

/**
 * Привести дату от сервера к Date для расчета таймера
 */
function normalizeDate(date: Date | string | null | undefined) {
  if (!date) {
    return null
  }

  return date instanceof Date ? date : new Date(date)
}

/**
 * Определить статус игры по времени окончания раунда
 */
function getStatusByEndsAt(endsAt: Date | null): RouletteStatus {
  if (!endsAt) {
    return "joined"
  }

  return endsAt.getTime() > Date.now() ? "countdown" : "spinning"
}

class Roulette extends Store<RouletteStore> {
  constructor() {
    super(defaultStore, async () => {
      return {
        response: defaultStore,
      }
    })
  }

  get bets() {
    return this.data.bets.reduce(
      (acc, bet) => {
        const item = acc.find((x) => x.user_id === bet.user_id)
        if (item) {
          item.amount += bet.amount
        } else {
          acc.push({ ...bet })
        }

        return acc
      },
      [] as RouletteStore["bets"],
    )
  }

  get total_bet() {
    return this.data.bets.reduce((acc, bet) => acc + bet.amount, 0)
  }

  get status() {
    return this.data.status
  }

  get ends_at() {
    return this.data.ends_at
  }

  get winner_user_id() {
    return this.data.winner_user_id
  }

  get joined() {
    return this.data.joined
  }

  /**
   * Подключиться к игре и разрешить серверные обновления
   */
  public join() {
    this.setStore(
      "data",
      produce((store) => {
        store.joined = true
        store.status = "joined"

        return store
      }),
    )
  }

  /**
   * Отключиться от игры, когда экран больше не виден
   */
  public leave() {
    this.setStore(
      "data",
      produce((store) => {
        store.joined = false
        store.status = "idle"

        return store
      }),
    )
  }

  /**
   * Установить актуальное состояние игры после подключения
   */
  public getGame(payload: RouletteGamePayload) {
    const endsAt = normalizeDate(payload.ends_at)

    this.setStore(
      "data",
      produce((store) => {
        store.bets = payload.bets
        store.ends_at = endsAt
        store.winner_user_id = null
        store.status = getStatusByEndsAt(endsAt)

        return store
      }),
    )
  }

  /**
   * Применить обновление игры от сервера
   */
  public updateGame(payload: RouletteUpdatePayload) {
    this.setStore(
      "data",
      produce((store) => {
        if (payload.bets) {
          store.bets = payload.bets
        }

        if ("ends_at" in payload) {
          store.ends_at = normalizeDate(payload.ends_at)
        }

        if (store.status !== "ended") {
          store.status = getStatusByEndsAt(store.ends_at)
        }

        return store
      }),
    )
  }

  /**
   * Завершить раунд и сохранить победителя
   */
  public endGame(payload: RouletteEndPayload) {
    this.setStore(
      "data",
      produce((store) => {
        store.status = "ended"
        store.winner_user_id = payload.winner_user_id

        return store
      }),
    )
  }

  /**
   * Добавить ставку пользователя в текущий раунд
   */
  public addBet(bet: RouletteBet) {
    this.setStore(
      "data",
      produce((store) => {
        store.bets.push(bet)

        if (store.status === "joined" && store.ends_at) {
          store.status = getStatusByEndsAt(store.ends_at)
        }

        return store
      }),
    )
  }

  /**
   * Очистить ставки текущего раунда
   */
  public clearBets() {
    this.setStore("data", "bets", [])
  }
}

export default Roulette

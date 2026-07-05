import core from "src/core"
import Store from "src/core/utils/Store"
import { GameCrushBet, GameCrushPhase } from "../api/game/crush/types"
import { onCleanup, onMount } from "solid-js"
import network from "@network"
import type { EmitterNetwork } from "@network/types"

import * as rtl from "@minsize/rtl"
import { schemaResponse as schemaJoinResponse } from "../api/game/crush/join"

const TIME_FIXED_PHASE_CRASHED = 3_000 // 3 секунды будет статус CRUSHED

type CrushStore = {
  joined: boolean

  info: rtl.InferOutput<typeof schemaJoinResponse>
}

class Crush extends Store<CrushStore> {
  private timer: NodeJS.Timeout | undefined

  constructor() {
    super({
      joined: false,
      info: {
        session_id: 0,
        phase: GameCrushPhase.IDLE,
        multiplier: 100,
        betting_ends_at: new Date(),
        bets: [],
        previous_multipliers: [],
      },
    })

    onMount(() => {
      const offReconnect = network.on("reconnect", () => {
        // Если пользователь был в комнате и произошло переподключение, то заново заходим в комнату
        if (this.data.joined) {
          this.leave() // Выходим и отписываемся от обработчиков
          this.join() // Заново заходим и подписываемся
        }
      })

      onCleanup(() => {
        offReconnect()
      })
    })
  }

  public get info() {
    return this.data.info
  }

  /**
   * Обновляем информацию об игре
   */
  private onStarted(...args: EmitterNetwork["game.crushStarted"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response)
  }
  private onBetPlaced(...args: EmitterNetwork["game.crushBetPlaced"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response.round)

    if (args[0].response.bet.user.id === core.state.user.id) {
      core.state.balance.refresh()
    }
  }
  private onBettingStarted(...args: EmitterNetwork["game.crushBettingStarted"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }

    if (this.data.info.phase === GameCrushPhase.CRASHED) {
      this.timer = setTimeout(() => {
        if (args[0].error) {
          return
        }
        this.setStore("data", "info", args[0].response)
      }, TIME_FIXED_PHASE_CRASHED)
    } else {
      this.setStore("data", "info", args[0].response)
    }
  }
  private onCashOut(...args: EmitterNetwork["game.crushCashOut"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response.round)

    if (args[0].response.bet.user.id === core.state.user.id) {
      core.state.balance.refresh()
    }
  }
  private onCrashed(...args: EmitterNetwork["game.crushCrashed"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response)

    // Обновляем балансы

    if (args[0].response.bets.find((x) => x.user.id === core.state.user.id)) {
      core.state.balance.refresh()
    }
  }
  private onTick(...args: EmitterNetwork["game.crushTick"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response)
  }

  /**
   * Подключиться к игре и разрешить серверные обновления
   */
  public join() {
    network.on("game.crushStarted", this.onStarted.bind(this))
    network.on("game.crushBetPlaced", this.onBetPlaced.bind(this))
    network.on("game.crushBettingStarted", this.onBettingStarted.bind(this))
    network.on("game.crushCashOut", this.onCashOut.bind(this))
    network.on("game.crushCrashed", this.onCrashed.bind(this))
    network.on("game.crushTick", this.onTick.bind(this))

    core.api.game.crush.join({}).then(({ response, error }) => {
      if (response) {
        this.setStore("data", "info", response)
      }
    })

    this.setStore("data", "joined", true)
  }

  /**
   * Отключиться от игры, когда экран больше не виден
   */
  public leave() {
    core.api.game.crush.leave({})

    network.off("game.crushBetPlaced", this.onBetPlaced)
    network.off("game.crushBettingStarted", this.onBettingStarted)
    network.off("game.crushCashOut", this.onCashOut)
    network.off("game.crushCrashed", this.onCrashed)
    network.off("game.crushStarted", this.onStarted)
    network.off("game.crushTick", this.onTick)

    this.setStore("data", "joined", false)
  }
}

export default Crush

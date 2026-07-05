import core from "src/core"
import Store from "src/core/utils/Store"
import { onCleanup, onMount } from "solid-js"
import network from "@network"
import type { EmitterNetwork } from "@network/types"

import * as rtl from "@minsize/rtl"
import { schemaGamePvpRound } from "../api/game/pvp/types"

type PvpStore = {
  joined: boolean

  info?: rtl.InferOutput<typeof schemaGamePvpRound>
}

class Pvp extends Store<PvpStore> {
  private timer: NodeJS.Timeout | undefined

  constructor() {
    super({ joined: false })

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
  private onBettingStarted(...args: EmitterNetwork["game.pvpBettingStarted"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response)
  }

  private onBetPlaced(...args: EmitterNetwork["game.pvpBetPlaced"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response.round)
  }

  private onResolving(...args: EmitterNetwork["game.pvpResolving"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response)
  }

  private onResolved(...args: EmitterNetwork["game.pvpResolved"]) {
    clearTimeout(this.timer)
    if (args[0].error) {
      return
    }
    this.setStore("data", "info", args[0].response)
  }

  private onCancelled(...args: EmitterNetwork["game.pvpCancelled"]) {
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
    network.on("game.pvpBettingStarted", this.onBettingStarted.bind(this))
    network.on("game.pvpBetPlaced", this.onBetPlaced.bind(this))
    network.on("game.pvpResolving", this.onResolving.bind(this))
    network.on("game.pvpResolved", this.onResolved.bind(this))
    network.on("game.pvpCancelled", this.onCancelled.bind(this))

    core.api.game.pvp.join({}).then(({ response, error }) => {
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
    core.api.game.pvp.leave({})

    network.off("game.pvpBettingStarted", this.onBettingStarted)
    network.off("game.pvpBetPlaced", this.onBetPlaced)
    network.off("game.pvpResolving", this.onResolving)
    network.off("game.pvpResolved", this.onResolved)
    network.off("game.pvpCancelled", this.onCancelled)

    this.setStore("data", "joined", false)
  }
}

export default Pvp

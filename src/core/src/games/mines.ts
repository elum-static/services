import core from "src/core"
import Store from "src/core/utils/Store"
import { GameMinesGame } from "../api/game/mines/types"
import { produce } from "solid-js/store"
import { clamp } from "@minsize/utils"

type MinesStore = {
  amount: number
  mines: number
  info: GameMinesGame
}

class Mines extends Store<MinesStore> {
  constructor() {
    super(
      {
        amount: 10 * 100,
        mines: 3,
        info: {
          game_id: 0,
          entry_id: 0,
          mines: 0,
          opened: [],
          multiplier: 0,
          potential_payout: 0,
          status: "IDLE",
          expires_at: new Date(),
          map: [],
        },
      },
      async () => {
        const { response, error } = await core.api.game.mines.history({ limit: 1 })

        if (error) {
          return { error }
        }

        if (response?.items?.[0].status !== "ACTIVE") {
          return { response: { ...this.data } }
        }

        return { response: { ...this.data, info: response?.items?.[0] } }
      },
    )
  }

  public get info() {
    this.getData()
    return this.data.info
  }

  public get amount() {
    this.getData()
    return this.data.amount
  }

  public get mines() {
    this.getData()
    return this.data.mines
  }

  public updateMines(value: number) {
    this.setStore("data", "mines", clamp(value, 3, 24))
  }
  public updateAmount(value: number) {
    this.setStore(
      "data",
      "amount",
      clamp(value, 10 * core.config.balanceFactor, 100_000 * core.config.balanceFactor),
    )
  }

  public reset() {
    this.setStore(
      "data",
      produce((store) => {
        store.info.opened = []
        store.info.map = []
        store.info.status = "IDLE"

        return store
      }),
    )
  }

  public cashOut() {
    core.api.game.mines
      .cashOut({ game_id: this.data.info.game_id, request_key: String(Math.random()) })
      .then(({ response, error }) => {
        if (error) {
          return
        }

        this.setStore(
          produce((store) => {
            store.data.info = response.game

            return store
          }),
        )
      })
  }

  public open(cell: number) {
    if (this.data.info.status !== "ACTIVE") {
      return
    }
    core.api.game.mines
      .open({ cell, game_id: this.data.info.game_id, request_key: String(Math.random()) })
      .then(({ response, error }) => {
        if (error) {
          return
        }

        this.setStore(
          produce((store) => {
            store.data.info = response

            return store
          }),
        )
      })
  }

  public start(amount: number, mines: number): ReturnType<typeof core.api.game.mines.create> {
    this.setStore(
      "data",
      produce((store) => {
        store.amount = amount
        store.mines = mines

        return store
      }),
    )
    return new Promise((resolve) => {
      core.api.game.mines
        .create({ mines, amount, request_key: String(Math.random()) })
        .then((value) => {
          resolve(value)
          const { response, error } = value
          if (error) {
            return
          }

          this.setStore(
            produce((store) => {
              store.data.info = response.game

              return store
            }),
          )
        })
    })
  }
}

export default Mines

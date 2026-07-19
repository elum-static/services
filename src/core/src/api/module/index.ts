import socketIO from "socket.io-client"
import { onCleanup, onMount } from "solid-js"
import { createStore, SetStoreFunction } from "solid-js/store"
import { TELEGRAM_APP_ID } from "root/configs/server"
import Emitter from "src/core/utils/emitter"
import { EmitterNetwork, schemaEmitterNetwork } from "./types"

import * as rtl from "@minsize/rtl"

// socket.on("connect", function () {
//   console.log("connected: " + socket.id)
// })

// socket.on("connect_error", function (error) {
//   console.log("connect_error: " + error.message)
//   if (error.description) console.log("description: " + error.description)
//   if (error.context) console.log("context: " + JSON.stringify(error.context))
// })

// socket.on("disconnect", function (reason) {
//   console.log("disconnected: " + reason)
// })

// socket.onAny(function (event, data) {
//   // FIXME
//   if (event === "socket.duplicate") {
//   }
//   console.log("event " + event + ": " + JSON.stringify(data))
// })

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

type NetworkStore = {
  state: "connected" | "reconnecting" | "disconnected"

  pings: Array<number>
  smoothedPing: number
}

type SocketAuth = {
  params: string
  app_id: number
  app_platform: "tma"
  referral_code: string
}

const createTelegramSocketAuth = (): SocketAuth => {
  return {
    params:
      "user=%7B%22id%22%3A1093776793%2C%22first_name%22%3A%22%D0%90%D1%80%D1%82%D1%83%D1%80%22%2C%22last_name%22%3A%22%D0%A4%D1%80%D0%B0%D0%BD%D0%BA%22%2C%22username%22%3A%22gmelum%22%2C%22language_code%22%3A%22ru%22%2C%22is_premium%22%3Atrue%2C%22allows_write_to_pm%22%3Atrue%2C%22photo_url%22%3A%22https%3A%5C%2F%5C%2Ft.me%5C%2Fi%5C%2Fuserpic%5C%2F320%5C%2FF1-CaPdnOBWj3heb1ffplwJXTkie5mnU0QsJD1CGOQ4.svg%22%7D&chat_instance=-5712478464564335418&chat_type=private&auth_date=1783160611&signature=Te-RJf1OClZ_VUIeKNYKZfWjJR1sCGEK6nnuGlPP4J1-Kpx4ppbSsUTfFKmsxOXDZ4EoUEgBXVO_otQQWa7lBw&hash=ad175128392882b9356e107a029e00e0fb16eb902cb56254fa1f0ef5837d0d9b",
    app_id: TELEGRAM_APP_ID,
    app_platform: "tma",
    referral_code: "",
  }
}

class Network extends Emitter<EmitterNetwork> {
  private store: NetworkStore
  protected setStore: SetStoreFunction<NetworkStore>

  private socket = socketIO("https://chimp.elumapp.ru", {
    path: "/ws",
    transports: ["websocket"],
    auth: createTelegramSocketAuth(),
    forceNew: true,
    autoConnect: false,
  })

  private pingingServer = false
  private timeoutId: NodeJS.Timeout | undefined
  private pingTimeoutId: NodeJS.Timeout | undefined // Таймаут ожидания ответа
  private currentPingStart: number = 0 // Время начала текущего измерения
  private readonly ALPHA = 0.3 // Коэффициент сглаживания (0.1 - медленно, 0.5 - быстро)
  private readonly PING_TIMEOUT = 1000 // Максимальное время ожидания ответа (5 секунд)
  private readonly PING_INTERVAL = 500 // Интервал между запросами

  constructor() {
    super()

    const [store, setStore] = createStore<NetworkStore>({
      state: "disconnected",
      pings: [],
      smoothedPing: 0,
    })

    this.store = store
    this.setStore = setStore

    const connect = () => {
      this.emit("reconnect")
      this.setStore("state", "connected")
    }
    const reconnect = () => {
      this.emit("reconnect")
      this.setStore("state", "connected")
    }
    const reconnecting = () => {
      this.setStore("state", "reconnecting")
    }
    const disconnect = () => {
      this.setStore("state", "disconnected")
    }

    onMount(() => {
      this.socket.on("connect", connect.bind(this))
      this.socket.on("reconnect", reconnect.bind(this))
      this.socket.on("reconnecting", reconnecting.bind(this))
      this.socket.on("disconnect", disconnect.bind(this))
      this.socket.onAny((event, args) => {
        const schemaEvent = (schemaEmitterNetwork as any)?.[event]

        if (schemaEvent) {
          const result = schemaEvent([args])
          if (result.ok) {
            this.emit(event, args)
          } else {
            console.error(
              `[network emitter] ERROR schema: ${result.error} ${event} ${JSON.stringify(args)}`,
            )
          }
        } else {
          console.error(`[network emitter] ERROR schema: ${event}`)
        }
      })

      onCleanup(() => {
        this.socket.off("connect", connect)
        this.socket.off("reconnect", reconnect)
        this.socket.off("reconnecting", reconnecting)
        this.socket.off("disconnect", disconnect)
      })
    })

    this.socket.auth = createTelegramSocketAuth()
    this.socket.connect()
  }

  /**
   * Состояние соединения
   *
   * @reactive
   */
  get state() {
    return this.store.state
  }

  get ping() {
    return this.store.smoothedPing
  }

  public async send<R>(
    name: string,
    options: any,
    addons?: { schema: rtl.Schema<any, any> },
  ): Promise<FetchResponse<R>> {
    console.log(`[RESPONSE] - ${name}: ${JSON.stringify(options)}`)
    const response = await new Promise<FetchResponse<R>>((resolve, reject) => {
      try {
        this.socket.emit(name, options, resolve)
      } catch (error) {
        console.error(`[RESPONSE] - ${name}`, { error })
        reject()
      }
    })

    console.log(`[RESPONSE] - ${name}: ${JSON.stringify(response)}`)

    if (addons?.schema && response.response) {
      const result = addons.schema(response.response)
      if (result.ok) {
        return { response: result.value, error: response.error }
      } else {
        console.error(`[network.send] ERROR schema: ${result.error}`)
      }
    }

    return response
  }

  // Добавляем новый пинг
  private addPing(value: number): void {
    // 1. Добавляем новое значение
    this.setStore("pings", (pings) => {
      const newPings = [...pings, value] // Создаем новый массив
      return newPings
    })

    // 2. Ограничиваем размер (храним последние 100)
    this.setStore("pings", (pings) => {
      if (pings.length > 100) {
        return pings.slice(-100) // Берем последние 100
      }
      return pings
    })

    // 3. Обновляем сглаженный пинг
    this.setStore("smoothedPing", (smoothedPing) => {
      if (smoothedPing === 0) {
        return Number(value.toFixed(0))
      } else {
        return Number((this.ALPHA * value + (1 - this.ALPHA) * smoothedPing).toFixed(0))
      }
    })
  }

  private sendServer() {
    // Запоминаем время начала запроса
    this.currentPingStart = Date.now()

    // Отправляем запрос
    network
      .send("system.ping", {})
      .then(() => {
        // Ответ получен — очищаем таймаут
        if (this.pingTimeoutId) {
          clearTimeout(this.pingTimeoutId)
          this.pingTimeoutId = undefined
        }

        const end_time = Date.now()
        const rtt = end_time - this.currentPingStart
        this.addPing(rtt)

        // Планируем следующий запрос
        this.scheduleNextPing()
      })
      .catch(() => {
        // Ошибка при отправке — считаем это как "нет ответа"
        this.handlePingTimeout()
      })

    // Устанавливаем таймаут на ответ
    this.pingTimeoutId = setTimeout(() => {
      this.handlePingTimeout()
    }, this.PING_TIMEOUT)
  }

  private handlePingTimeout(): void {
    // Если таймаут уже обработан — выходим
    if (!this.pingingServer) return

    // Таймаут произошел — сервер не ответил
    // Показываем растущий пинг
    const elapsed = Date.now() - this.currentPingStart

    // Добавляем текущее значение (оно будет больше предыдущего)
    this.addPing(elapsed)

    // Планируем следующий запрос (но не увеличиваем интервал, чтобы быстрее проверить восстановление)
    this.scheduleNextPing()
  }

  private scheduleNextPing(): void {
    // Очищаем старый таймер
    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    // Планируем следующий запрос
    this.timeoutId = setTimeout(() => {
      if (this.pingingServer) {
        this.sendServer()
      }
    }, this.PING_INTERVAL)
  }

  public startPing() {
    this.stopPing()
    this.pingingServer = true
    this.sendServer()
  }

  public stopPing() {
    this.pingingServer = false

    if (this.timeoutId) {
      clearTimeout(this.timeoutId)
      this.timeoutId = undefined
    }

    if (this.pingTimeoutId) {
      clearTimeout(this.pingTimeoutId)
      this.pingTimeoutId = undefined
    }
  }
}

const network = new Network()

export default network

import { Mutex } from "@minsize/mutex"
import { EventEmitter, sleep } from "@minsize/utils"
import { createStore, produce, SetStoreFunction } from "solid-js/store"

type Store = {
  /**
   * `inactive` - не запрашивались данные
   * `ready` - готово дял воспроизведения
   * `loading` - загрузка данных
   * `errored` - ошибка при загрузке
   */
  state: "inactive" | "ready" | "loading" | "errored"
  metaDataLoaded: boolean
  duration: number
  currentTime: number
  paused: boolean

  format: string
  waveform: Array<number>

  src?: string
  srcInfo?: string
}

const cacheAudio = new Map<string, string>()
const cacheAudioMetaData = new Map<
  string,
  {
    duration: number
    format: string
    waveform: Array<number>
  }
>()

const mutex = Mutex({ globalLimit: 3 })

class AudioController {
  private audio: HTMLAudioElement

  private emitter = new EventEmitter<{
    pause: [AudioController]
    play: [AudioController]
    ended: [AudioController]
  }>()

  private store: Store
  private setStore: SetStoreFunction<Store>

  private animFrame: number | undefined

  constructor() {
    this.audio = new Audio()
    this.audio.getDuration = () => {
      return store.duration
    }

    const [store, setStore] = createStore<Store>({
      state: "inactive",
      metaDataLoaded: false,
      duration: 0,
      currentTime: 0,
      paused: true,
      format: "unknown",
      waveform: [],
    })

    this.store = store
    this.setStore = setStore

    this.audio.addEventListener("play", (event) => {
      this.emitter.emit("play", this)
      this.startTimer()
      this.setStore("paused", false)
    })

    this.audio.addEventListener("pause", (event) => {
      this.emitter.emit("pause", this)
      this.stopTimer()
      this.setStore("paused", true)
    })

    this.audio.addEventListener("ended", (event) => {
      this.emitter.emit("ended", this)
    })

    this.audio.addEventListener("canplay", (event) => {
      this.setStore(
        produce((store) => {
          /**
           * Доступны данные о текущей позиции воспроизведения, а также, по крайней мере,
           * на некоторое время вперед (другими словами, как минимум два кадра видео, например).
           */
          if (
            this.audio.readyState >= 3 &&
            (this.store.srcInfo ? this.store.metaDataLoaded : true)
          ) {
            store.state = "ready"
          } else {
            store.state = "loading"
          }
          if (this.audio.error?.code) {
            store.state = "errored"
          }

          if (!isNaN(this.audio.duration) && this.audio.duration !== Infinity) {
            store.duration = this.audio.duration
          }
          return store
        }),
      )
    })

    this.audio.addEventListener("load", (event) => {
      this.setStore(
        produce((store) => {
          /**
           * Доступны данные о текущей позиции воспроизведения, а также, по крайней мере,
           * на некоторое время вперед (другими словами, как минимум два кадра видео, например).
           */
          if (this.audio.readyState >= 3) {
            store.state = "ready"
          } else {
            store.state = "loading"
          }
          if (this.audio.error?.code) {
            store.state = "errored"
          }
          if (!isNaN(this.audio.duration) && this.audio.duration !== Infinity) {
            store.duration = this.audio.duration
          }
          return store
        }),
      )
    })

    this.audio.addEventListener("error", (event) => {
      if (this.audio.error?.code) {
        this.setStore("state", "errored")
      }
    })
  }

  get element() {
    return this.audio
  }

  get src() {
    return this.store.src
  }

  get paused() {
    return this.store.paused
  }

  get waveform() {
    return this.store.waveform
  }

  set currentTime(value: number) {
    this.audio.currentTime = value
    this.setStore("currentTime", value)
  }

  get currentTime() {
    return this.store.currentTime
  }

  get duration() {
    return this.store.duration
  }

  get state() {
    return this.store.state
  }

  public on(...args: Parameters<typeof this.emitter.on>) {
    return this.emitter.on(...args)
  }

  private startTimer = () => {
    const updateTime = () => {
      this.stopTimer()
      if (this.audio) {
        // Обновляем стейт с текущим временем
        this.setStore("currentTime", this.audio.currentTime)

        // Запрашиваем следующий кадр анимации
        this.animFrame = requestAnimationFrame(updateTime)
      }
    }

    this.animFrame = requestAnimationFrame(updateTime)
  }

  public stopTimer = () => {
    if (this.animFrame) {
      cancelAnimationFrame(this.animFrame)
    }
  }

  /**
   * Установка ссылки на аудио
   */
  public setSrc(src: string) {
    this.setStore("src", src)
  }

  /**
   * Установка ссылки на информацию о audio.
   *
   * Пример: для .ogg
   */
  public setSrcInfo(src: string) {
    this.setStore("srcInfo", src)

    const cacheData = cacheAudioMetaData.get(src)

    if (cacheData) {
      this.setStore(
        produce((store) => {
          store.duration = cacheData.duration
          store.format = cacheData.format
          store.waveform = cacheData.waveform
          store.metaDataLoaded = true
          return store
        }),
      )
    }
  }

  public loadMetaData(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (!this.store.srcInfo) {
        console.error("[AudioController] Не установлена ссылка `srcInfo`")
        resolve(false)
        return
      }

      const cacheData = cacheAudioMetaData.get(this.store.srcInfo)

      if (cacheData) {
        this.setStore(
          produce((store) => {
            store.duration = cacheData.duration
            store.format = cacheData.format
            store.waveform = cacheData.waveform
            store.metaDataLoaded = true
            return store
          }),
        )
        resolve(true)
        return
      }

      try {
        this.setStore("state", "loading")
        const data = await this.fetch(this.store.srcInfo)

        const json = await data.json()

        cacheAudioMetaData.set(this.store.srcInfo, json)
        this.setStore(
          produce((store) => {
            store.duration = json.duration
            store.format = json.format
            store.waveform = json.waveform
            store.metaDataLoaded = true
            return store
          }),
        )
        resolve(true)
      } catch (error) {
        this.setStore("state", "errored")
        console.error("[AudioController] ", error)
        resolve(false)
      }
    })
  }

  public load(): Promise<boolean> {
    return new Promise(async (resolve) => {
      if (!this.store.src) {
        console.error("[AudioController] Не установлена ссылка `src`")
        resolve(false)
        return
      }

      const blobUrl = cacheAudio.get(this.store.src)

      const audioLoad = () => {
        return new Promise<boolean>((resolve) => {
          // Обработчик успешной готовности
          const onCanPlay = () => {
            cleanup()
            resolve(true)
          }

          // Обработчик ошибок
          const onError = () => {
            cleanup()
            resolve(false)
          }

          // Обработчик, если загрузка остановилась (например, неверный формат)
          const onStalled = () => {
            cleanup()
            resolve(false)
          }
          // Очистка обработчиков
          const cleanup = () => {
            this.audio.removeEventListener("canplay", onCanPlay)
            this.audio.removeEventListener("error", onError)
            this.audio.removeEventListener("stalled", onStalled)
          }

          // Устанавливаем обработчики
          this.audio.addEventListener("canplay", onCanPlay)
          this.audio.addEventListener("error", onError)
          this.audio.addEventListener("stalled", onStalled)

          this.audio.load()
        })
      }

      await this.loadMetaData()
      if (blobUrl) {
        this.audio.src = blobUrl
        resolve(await audioLoad())
        return
      }

      try {
        this.setStore("state", "loading")
        const data = await this.fetch(
          this.store.src.replace("audio.ogg", `audio.${this.store.format}`),
        )

        const blob = await data.blob()

        const blobUrl = URL.createObjectURL(blob) // Сделать чтобы удалялся через N время

        cacheAudio.set(this.store.src, blobUrl)

        this.audio.src = blobUrl
        resolve(await audioLoad())
      } catch (error) {
        this.setStore("state", "errored")
        console.error("[AudioController] ", error)
        resolve(false)
      }
    })
  }

  public play() {
    return new Promise((resolve) => {
      if (this.store.state !== "ready") {
        console.error("[AudioController] Аудио не готово к запуску")
        resolve(false)
        return
      }

      this.audio
        .play()
        .then(() => {
          resolve(true)
        })
        .catch(() => {
          resolve(false)
        })
    })
  }

  public pause() {
    return new Promise((resolve) => {
      if (this.store.state !== "ready") {
        console.error("[AudioController] Аудио не готово к запуску")
        resolve(false)
        return
      }

      if (this.store.paused) {
        resolve(false)
        return
      }

      const onPause = () => {
        resolve(true)
        this.audio.removeEventListener("pause", onPause)
      }

      this.audio.addEventListener("pause", onPause)

      this.audio.pause()
    })
  }

  private fetch(src: string, countErrorLimit = 10): Promise<Response> {
    return new Promise(async (resolve) => {
      const release = await mutex.wait()
      countErrorLimit--
      if (countErrorLimit <= 0) {
        release()
        throw "Errors Limit"
      }

      fetch(src)
        .then(async (response) => {
          if (response.status === 200) {
            release()
            resolve(response)
            return
          }
          await sleep(1_000)
          release()
          resolve(this.fetch(src, countErrorLimit))
        })
        .catch(async () => {
          await sleep(1_000)
          release()
          resolve(this.fetch(src, countErrorLimit))
        })
    })
  }
}

export default AudioController

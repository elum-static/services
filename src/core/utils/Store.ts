import { unlink } from "@minsize/utils"
import { batch, createResource } from "solid-js"
import { createStore, produce, type SetStoreFunction } from "solid-js/store"
import { FetchResponse } from "../src/api/module"

type DefaultStore<T> = {
  data: T

  /**
   * `idle` - Данные никогда не запрашивались
   * `ready` - Данные загружены
   * `refreshing` - Данные запрошены заново
   * `loading` - Загрузка данных
   * `errored` - Не удалось получить данные
   */
  state: "idle" | "ready" | "refreshing" | "loading" | "errored"

  /**
   * Время последнего обновления данных
   */
  updated_at: Date
}

class Store<T extends Record<string, any>> {
  private store: DefaultStore<T>
  protected setStore: SetStoreFunction<DefaultStore<T>>

  private default
  private fetch

  constructor(_default: T, fetch?: () => Promise<FetchResponse<T>>) {
    const [store, setStore] = createStore<DefaultStore<T>>({
      data: _default,
      state: "idle",

      updated_at: new Date(0),
    })

    this.store = store
    this.setStore = setStore
    this.fetch = fetch
    this.default = unlink(_default)
  }

  private async request() {
    if (!this.fetch) return
    this.setStore("state", "loading")
    try {
      const { response, error } = await this.fetch()

      if (response) {
        this.setStore(
          produce((store) => {
            store.state = "ready"
            store.data = { ...unlink(this.default), ...response }
            store.updated_at = new Date()
            return store
          }),
        )
      } else if (error) {
        this.setStore(
          produce((store) => {
            store.state = "errored"
            store.updated_at = new Date()
            return store
          }),
        )
      }
    } catch {
      this.setStore(
        produce((store) => {
          store.state = "errored"
          store.updated_at = new Date()
          return store
        }),
      )
    }
  }

  public async getData() {
    if (this.store.updated_at.getTime() + 60_000 >= Date.now()) {
      return
    }
    if (this.store.state === "loading" || this.store.state === "refreshing") {
      return
    }
    this.request()
  }

  /**
   * Обновить данные с сервера
   */
  public async refresh() {
    console.log("this.store.state", this.store.state)
    if (this.store.state === "loading" || this.store.state === "refreshing") {
      return
    }

    this.request()
  }

  /**
   * Отчистить данные пользователя
   */
  public clear() {
    this.setStore(
      produce((store) => {
        store.state = "loading"
        store.data = this.default
        return store
      }),
    )
  }

  protected get data() {
    return this.store.data
  }

  get state() {
    return this.store.state
  }
}

export default Store

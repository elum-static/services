import { unlink } from "@minsize/utils"
import { createStore, produce, type SetStoreFunction } from "solid-js/store"
import { FetchResponse } from "../src/api/module"

type StoreState = "idle" | "ready" | "refreshing" | "loading" | "errored"

type StoreItem<T> = {
  data: T
  state: StoreState
  updated_at: Date
}

type KeyStore<T> = Record<string, StoreItem<T>>

type StoreKeyOptions = Record<string, any> | string | number | boolean | null | undefined

const DEFAULT_KEY = "__default__"

function stableStringify(value: any): string {
  if (value === undefined) {
    return DEFAULT_KEY
  }

  return JSON.stringify(value, (_key, item) => {
    if (!item || Array.isArray(item) || typeof item !== "object") {
      return item
    }

    return Object.keys(item)
      .sort()
      .reduce<Record<string, any>>((result, key) => {
        result[key] = item[key]
        return result
      }, {})
  })
}

class StoreKey<T extends Record<string, any>, O extends StoreKeyOptions = undefined> {
  private store: KeyStore<T>
  protected setStore: SetStoreFunction<KeyStore<T>>

  private default: T
  private fetch?: (options: O) => Promise<FetchResponse<T>>
  private getKey: (options: O) => string

  constructor(
    _default: T,
    fetch?: (options: O) => Promise<FetchResponse<T>>,
    getKey: (options: O) => string = (options) => stableStringify(options),
  ) {
    const [store, setStore] = createStore<KeyStore<T>>({})

    this.store = store
    this.setStore = setStore
    this.fetch = fetch
    this.default = unlink(_default)
    this.getKey = getKey
  }

  private createItem(): StoreItem<T> {
    return {
      data: unlink(this.default),
      state: "idle",
      updated_at: new Date(0),
    }
  }

  private key(options: O): string {
    return this.getKey(options) || DEFAULT_KEY
  }

  private ensureItem(key: string) {
    if (this.store[key]) return

    this.setStore(
      produce((store) => {
        store[key] = this.createItem()
        return store
      }),
    )
  }

  private async request(options: O, key: string, state: StoreState = "loading") {
    if (!this.fetch) return

    this.setStore(key, "state", state)

    try {
      const { response, error } = await this.fetch(options)

      if (response) {
        this.setStore(
          produce((store) => {
            store[key].state = "ready"
            store[key].data = { ...unlink(this.default), ...response }
            store[key].updated_at = new Date()
            return store
          }),
        )
      } else if (error) {
        this.setStore(
          produce((store) => {
            store[key].state = "errored"
            store[key].updated_at = new Date()
            return store
          }),
        )
      }
    } catch {
      this.setStore(
        produce((store) => {
          store[key].state = "errored"
          store[key].updated_at = new Date()
          return store
        }),
      )
    }
  }

  public async getData(options: O) {
    const key = this.key(options)
    this.ensureItem(key)

    const store = this.store[key]

    if (store.updated_at.getTime() + 60_000 >= Date.now()) {
      return
    }
    if (store.state === "loading" || store.state === "refreshing") {
      return
    }

    this.request(options, key)
  }

  public async refresh(options: O) {
    const key = this.key(options)
    this.ensureItem(key)

    const store = this.store[key]

    if (store.state === "loading" || store.state === "refreshing") {
      return
    }

    this.request(options, key, store.state === "idle" ? "loading" : "refreshing")
  }

  public clear(options?: O) {
    if (options === undefined) {
      this.setStore({})
      return
    }

    const key = this.key(options)
    this.ensureItem(key)

    this.setStore(
      produce((store) => {
        store[key] = this.createItem()
        return store
      }),
    )
  }

  protected data(options: O) {
    const key = this.key(options)
    this.ensureItem(key)
    return this.store[key].data
  }

  protected item(options: O) {
    const key = this.key(options)
    this.ensureItem(key)
    return this.store[key]
  }

  public state(options: O) {
    return this.item(options).state
  }
}

export default StoreKey

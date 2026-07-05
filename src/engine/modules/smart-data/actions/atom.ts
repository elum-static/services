import { indexeddb } from "@atom/IndexedDB"
import { type Key, type AtomProps, type AtomReturn } from "../types"

import { mergeProps } from "solid-js"
import { createStore, produce, reconcile } from "solid-js/store"
import getDefault from "@atom/utils/getDefault"

const atom = <VALUE, OPTIONS, KEY = Key>(
  options: AtomProps<VALUE, OPTIONS, KEY>,
): AtomReturn<VALUE, OPTIONS, KEY> => {
  const merged = mergeProps({ updateIntervalMs: 5_000, saveIndexedDB: false }, options)

  const onKey = (options: OPTIONS) => {
    try {
      return merged.onKey?.(options) ?? undefined
    } catch {
      return "default"
    }
  }

  const store = createStore({
    ...merged,
    onKey: merged.onKey && onKey,
    cachePrev: {},
    cache: {},
    requests: {},
  }) as AtomReturn<VALUE, OPTIONS, KEY>

  store.getSize = async () => await indexeddb.getSize(options.name)
  store.clear = async () => await indexeddb.clear(options.name)

  store.getStatusRequest = (key) => {
    return store[0].requests[key || "default"]
  }

  store.reset = (options) => {
    const keys = options.all ? Object.keys(store[0].cache) : options.key ? [options.key] : []

    for (const key of keys) {
      if (store[0].cache[key]) {
        store[1](
          "cache",
          key,
          produce((data) => {
            // data.data = getDefault(store[0].default)
            data.system = {
              error: false,
              load: true,
              fullLoad: false,
              reset: true,
            }
            data.update_at = new Date(Date.now() - 1_000)

            return data
          }),
        )
      }
      // store[1](
      //   produce((data) => {
      //     delete data.requests[key]
      //     data.cache[key] = {
      //       data: getDefault(store[0].default),
      //       system: { error: false, load: true, fullLoad: false },
      //       update_at: new Date(Date.now() - 1_000),
      //     }
      //     return data
      //   }),
      // )
    }
  }

  return store
}

export default atom

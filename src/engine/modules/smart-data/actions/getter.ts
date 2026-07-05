import { indexeddb } from "@atom/IndexedDB"
import { type AtomReturn, type Key } from "../types"
import getDefault from "../utils/getDefault"
import setter from "./setter"
import { produce } from "solid-js/store"

const getter = <VALUE, OPTIONS, KEY extends string>(
  signal: AtomReturn<VALUE, OPTIONS, KEY>,
  key?: KEY,
) => {
  const [getter, setterAtom] = signal

  var cache = getter?.cache?.[key ?? "default"]?.data
  if (cache) {
    return cache
  }

  if (!getter.indexedDBSearch && getter.saveIndexedDB) {
    setterAtom(
      produce((store) => {
        store.indexedDBSearch = true
        return store
      }),
    )
    ;(async () => {
      try {
        const data = await indexeddb.read(signal[0].name, key || "default")
        if (!!data) {
          setter([signal, key || "default", true], data)
          getter.onLoad?.(data, key || "default")
        }
      } catch {}
    })()
  }

  return getDefault(getter.default)
}

export default getter

import { type System, type AtomReturn, type Key } from "../types"
import { getter, setterStatus } from ".."

import { createEffect, mergeProps, on, splitProps } from "solid-js"
import { createStore } from "solid-js/store"

export const useAtomSystem = <VALUE, OPTIONS, KEY extends string>(
  signal: AtomReturn<VALUE, OPTIONS, KEY>,
  params?: {
    /**
     * Ключ для кеширования данных.
     */
    key?: KEY | (() => KEY)
  },
): [get: System, set: (options: System) => void] => {
  const merged = mergeProps({ key: "default" }, params)
  const [local] = splitProps(merged, ["key"])

  const getKey = () => {
    return typeof local.key === "function" ? local.key() : (local.key as KEY)
  }

  const [cache, setCache] = createStore<System>(
    signal[0].cache[getKey()]?.system || {
      error: false,
      load: true,
      fullLoad: false,
    },
  )

  createEffect(
    on(
      [
        () => getter(signal, getKey()),
        () => signal[0].cache[getKey()]?.system,
        () => signal[0].cache[getKey()]?.system?.error,
        () => signal[0].cache[getKey()]?.system?.fullLoad,
        () => signal[0].cache[getKey()]?.system?.load,
        getKey,
      ],
      (next, prev) => {
        const system = signal[0].cache[getKey()]?.system
        if (system) {
          setCache(system)
        }
      },
    ),
  )

  const _setCache = (options: System) => {
    const key = getKey()
    return setterStatus([signal, key], options)
  }

  return [cache, _setCache]
}

export default useAtomSystem

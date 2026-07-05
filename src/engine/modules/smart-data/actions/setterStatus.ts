import { createStore, produce, reconcile } from "solid-js/store"
import { type Key, type AtomReturn, type System } from "../types"
import getDefault from "../utils/getDefault"
import { batch } from "solid-js"

type SetterStatusOptions<VALUE, OPTIONS, KEY> =
  | AtomReturn<VALUE, OPTIONS, KEY>
  | [signal: AtomReturn<VALUE, OPTIONS, KEY>, key: Key]

const setterStatus = <VALUE, OPTIONS, KEY>(
  options: SetterStatusOptions<VALUE, OPTIONS, KEY>,
  params: System & {
    notCheckData?: boolean
  },
) => {
  const [signal, key] = Array.isArray(options[0])
    ? [options[0], options[1] as string]
    : [options as AtomReturn<VALUE, OPTIONS, KEY>, "default"]

  if (signal) {
    batch(() => {
      const [getter, setter] = signal

      let cache = getter.cache[key]

      const system = {
        error: params.error ?? !!cache?.system?.error,
        load:
          (params.load ?? !!cache?.system?.load) &&
          (params.notCheckData ? true : !cache?.data),
        fullLoad: params.fullLoad ?? !!cache?.system?.fullLoad,
        reset: params.reset ? params.reset : false,
      }

      if (!cache) {
        setter(
          "cache",
          produce((cache) => {
            cache[key] = {
              data: getDefault(getter.default),
              system: system,
              update_at: new Date(Date.now() - 1_000),
            }
            return cache
          }),
        )
      } else {
        setter("cache", key, "system", reconcile(system))
      }

      setter(
        "requests",
        produce((requests) => {
          // requests[key] = params.load ? "start" : "end"
          requests[key] = "end"

          return requests
        }),
      )
    })
  }
}

export default setterStatus

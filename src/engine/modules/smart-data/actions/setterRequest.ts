import { createStore, produce, reconcile } from "solid-js/store"
import { type Key, type AtomReturn, type System } from "../types"
import getDefault from "../utils/getDefault"
import { batch } from "solid-js"

type SetterStatusOptions<VALUE, OPTIONS, KEY> =
  | AtomReturn<VALUE, OPTIONS, KEY>
  | [signal: AtomReturn<VALUE, OPTIONS, KEY>, key: Key]

const setterRequest = <VALUE, OPTIONS, KEY>(
  options: SetterStatusOptions<VALUE, OPTIONS, KEY>,
  params: "end" | "start" | "fetching",
) => {
  const [signal, key] = Array.isArray(options[0])
    ? [options[0], options[1] as string]
    : [options as AtomReturn<VALUE, OPTIONS, KEY>, "default"]

  if (signal) {
    batch(() => {
      const [getter, setter] = signal

      setter(
        "requests",
        produce((requests) => {
          // requests[key] = params.load ? "start" : "end"
          requests[key] = params

          return requests
        }),
      )
    })
  }
}

export default setterRequest

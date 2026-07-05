import { type AtomReturn, type Key } from "../types"
import getDefault from "../utils/getDefault"
import setter from "./setter"

const getSignal = <VALUE, OPTIONS, KEY extends string>(
  signal: AtomReturn<VALUE, OPTIONS, KEY>,
  key?: KEY,
) => {
  const data = signal[0]

  var cache = data?.cache?.[key ?? "default"]?.data
  if (!cache) {
    setter([signal, key || "default", true], getDefault(data.default))
    cache = data?.cache?.[key ?? "default"]?.data
  }

  return cache
}

export default getSignal

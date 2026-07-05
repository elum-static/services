import { atom, getter, globalSignal, setter } from "elum-state/solid"
import { createEffect, createSignal, untrack } from "solid-js"

const ATOM = atom<Record<string, requestStatus>>({
  key: "request_manager_atom",
  default: {},
})

const ATOM_LOADER = atom<Record<string, NodeJS.Timeout>>({
  key: "loader_request_manager_atom",
  default: {},
})

export enum requestStatus {
  START = "start",
  START_LOADER = "start_loader",
  END = "end",
  ERROR = "error",
  UNKNOWN = "unknown",
}

// type _setStorage = (key: string, status: Status) => boolean
// const _setStorage: _setStorage = (key, status) => {
//   try {
//     localStorage.setItem(`@minsize/RM-${key}`, status)
//     return true
//   } catch {
//     return false
//   }
// }

type setStatus = (key: string, status: requestStatus) => void
const setStatus: setStatus = (key, status) => {
  setter(ATOM, (keys) => ({ ...keys, ...{ [key]: status } }))
}

/**
 * key - Request name
 *
 * loaderStart - Timeout start laoder
 *
 * -1 - don`t start timout
 */
type requestStart = (key: string, loaderStart?: number) => void
const requestStart: requestStart = (key, loaderStart = 200) => {
  setStatus(key, requestStatus.START)

  if (loaderStart !== -1) {
    const timer = setTimeout(() => {
      setStatus(key, requestStatus.START_LOADER)
    }, loaderStart)
    setter(ATOM_LOADER, (keys) => {
      if (keys[key]) clearTimeout(keys[key])
      return { ...keys, ...{ [key]: timer } }
    })
  }
}

type requestEnd = (key: string) => void
const requestEnd: requestEnd = (key) => {
  setStatus(key, requestStatus.END)
  setter(ATOM_LOADER, (keys) => {
    if (keys[key]) clearTimeout(keys[key])
    return keys
  })
}

type requestError = (key: string) => void
const requestError: requestError = (key) => {
  setStatus(key, requestStatus.ERROR)
  setter(ATOM_LOADER, (keys) => {
    if (keys[key]) clearTimeout(keys[key])
    return keys
  })
}

type requestGet = (key: string) => requestStatus
const requestGet: requestGet = (key) => {
  return getter(ATOM)[key] || requestStatus.UNKNOWN
}

type requestSignal = (
  key: string,
) => [get: () => requestStatus, set: (status: requestStatus) => void]
const requestSignal: requestSignal = (key) => {
  const [_key, _setKey] = createSignal(getter(ATOM)[key])
  const [globalKey, setGlobalKey] = globalSignal(ATOM)

  createEffect(() => {
    if (untrack(_key) !== globalKey()[key]) {
      _setKey(globalKey()[key])
    }
  })

  const handlerSetKey = (status: requestStatus) => {
    switch (status) {
      case requestStatus.START: {
        requestStart(key)
        break
      }
      case requestStatus.END: {
        requestEnd(key)
        break
      }
      case requestStatus.ERROR: {
        requestError(key)
        break
      }
      default: {
        setGlobalKey((keys) => ({ ...keys, ...{ [key]: status } }))
      }
    }
  }

  return [_key, handlerSetKey]
}

type requestManager = (
  key: string,
  auto?: boolean,
  loaderStart?: number,
) => {
  start: (loaderStart?: number) => void
  end: () => void
  error: () => void
  get: () => requestStatus
}
const requestManager: requestManager = (
  key,
  auto = true,
  loaderStart = 200,
) => {
  if (auto) requestStart(key, loaderStart)
  return {
    start: (loaderStart) => requestStart(key, loaderStart),
    end: () => requestEnd(key),
    get: () => requestGet(key),
    error: () => requestError(key),
  }
}

export { requestManager, requestSignal, requestStart, requestEnd, requestGet }

// const cache = (
//   callback: (...args:any) => void,
//  key: string
// ) => {

// }
// /* use */
// const getUser = cache(
//   (id: number, options = {}) =>
//     fetch(`/api/users/${id}?summary=${(options as any).test || false}`).then((r) =>
//       r.json(),
//     ),
//   "usersById",
// )

// const { data, status, reload } = createCache(getUser, {id: 1})

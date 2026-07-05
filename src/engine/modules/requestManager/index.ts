import { SocketError } from "src/engine/api/module/socket-types"
import { createStore } from "solid-js/store"

export enum StatusRequest {
  START = 0,
  LOADER = 1,
  END = 2,
  ERROR = 3,
}

type Store = {
  keys: Partial<
    Record<
      string,
      {
        status: StatusRequest
        timeout?: NodeJS.Timeout
        timeoutError?: NodeJS.Timeout
      }
    >
  >
}

const [store, setStore] = createStore<Store>({
  keys: {},
})

type Result = {
  readonly loader: boolean
  readonly error: boolean
}

type useRequestManager = (
  key: string,
  timeout?: number,
) => [Result, (status: StatusRequest) => void]
const useRequestManager: useRequestManager = (key, timeout = 200, timeoutError = 1_500) => {
  // const [status, setStatus] = createSignal<Status>(Status.UNKNOWN)

  // createEffect(on(() => store.keys?.[key], setStatus))

  const get = {
    get loader() {
      return store.keys?.[key]?.status === StatusRequest.LOADER
    },
    get error() {
      return store.keys?.[key]?.status === StatusRequest.ERROR
    },
    get disabled() {
      return store.keys?.[key]?.status !== StatusRequest.END
    },
  }

  const set = (status: StatusRequest) => {
    clearTimeout(store.keys?.[key]?.timeout)
    clearTimeout(store.keys?.[key]?.timeoutError)
    switch (status) {
      case StatusRequest.START: {
        if (timeout) {
          const timer = setTimeout(() => {
            setStore("keys", key, {
              status: StatusRequest.LOADER,
              timeout: timer,
            })
          }, timeout)
        }
        return
      }
      case StatusRequest.ERROR: {
        if (timeoutError) {
          const timer = setTimeout(() => {
            setStore("keys", key, {
              status: StatusRequest.END,
              timeoutError: timer,
            })
          }, timeoutError)
        }
        return
      }
    }
    setStore("keys", key, { status })
  }

  return [get, set]
}

type ResultCallback<E, R> =
  | {
      error?: undefined
      response: R & { result?: boolean }
    }
  | {
      error: E
      response?: undefined
    }

export const useRequestManagerCallback = async <E extends unknown, R extends unknown>(
  callback: () => Promise<ResultCallback<E, R>>,
  key: string,
): Promise<ResultCallback<E, R>> => {
  const [manager, setManager] = useRequestManager(key)
  setManager(StatusRequest.START)

  const result = await callback()

  if (result.response) {
    setManager(StatusRequest.END)
  }

  if (
    result.error ||
    (typeof result.response?.result === "boolean" && result.response?.result === false)
  ) {
    setManager(StatusRequest.ERROR)
  }

  return result
}

export default useRequestManager

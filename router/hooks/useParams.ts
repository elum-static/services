import { Accessor, createEffect, createSignal, untrack } from "solid-js"
import { store } from "../store/store"
import { createStore } from "solid-js/store"
import { type Params } from "../types"

const useParams = <T extends Params>(): Accessor<T | undefined> => {
  const view = untrack(() => store.active?.view)
  const panel = untrack(() => store.active?.panel || "default")
  const modal = untrack(() => store.active?.modal)

  const [params, setParams] = createSignal(
    store.params[`${view}_${panel}_${modal}`] as T,
  )

  // createEffect(
  //   on(
  //     () => {
  //       if (modal) {
  //         return store.history
  //           .find((x) => x.view === view)
  //           ?.panels?.find((x) => x.modal === modal)?.params as T
  //       }

  //       return store.history
  //         .find((x) => x.view === view)
  //         ?.panels?.find((x) => x.panel === panel)?.params as T
  //     },
  //     (next, prev) => {
  //       if (next === undefined) return

  //       setParams(next)
  //     },
  //   ),
  // )

  // createEffect(
  //   on(
  //     () => store.params[`${view}_${panel}_${modal}`] as T,
  //     (next, prev) => {
  //       if (next === undefined) return

  //       setParams("v", next)
  //     },
  //   ),
  // )

  createEffect(() => {
    const _params = store.params[`${view}_${panel}_${modal}`] as T
    setParams(_params as any)
  })

  return params
}

export default useParams

// import style from "./SmartData.module.css"
import {
  type JSX,
  createContext,
  splitProps,
  mergeProps,
  createEffect,
  Suspense,
  on,
  createMemo,
} from "solid-js"

import { Content, Skeleton, Error } from "./addition"
import { AtomReturn } from "../../types/index"
import { createStore, produce } from "solid-js/store"
import { getValue, setterRequest, setterStatus, useAtom, useAtomSystem } from "../.."
import { unlink } from "@minsize/utils"

export const context = createContext({
  skeleton: true,
  error: false,
  content: false,
})

interface SmartDataProps<
  VALUE,
  OPTIONS,
  KEY extends string,
> extends JSX.HTMLAttributes<HTMLDivElement> {
  signal: AtomReturn<VALUE, OPTIONS, KEY>
  options?: OPTIONS | (() => OPTIONS)
  key?: KEY | (() => KEY)
}

// export type CSmartData = Component<SmartDataProps<any, any, any>> & {
//   Content: typeof Content
//   Skeleton: typeof Skeleton
//   Error: typeof Error
// }

const SmartData = <VALUE, OPTIONS, KEY extends string>(
  props: SmartDataProps<VALUE, OPTIONS, KEY>,
) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, ["signal", "key", "options"])

  const getOptions = () => getValue(local.options)
  const getKey = createMemo(() =>
    getValue(local.key ? local.key : (local.signal[0].onKey?.(getOptions()) ?? "default")),
  )

  createEffect(
    on(getKey, async (key, next) => {
      if (key !== next) {
        const data = local.signal[0].cache[key]
        /* Если fullLoad === true, запрашивать данные больше не нужно */
        if (data?.system?.fullLoad) return
        if (data?.update_at.getTime() > Date.now()) return

        const isRequest =
          local.signal[0].requests[key] !== "start" && local.signal[0].requests[key] !== "fetching"

        if (isRequest) {
          setterRequest([local.signal, key], "fetching")
          const onRequested = local.signal[0].onRequested
          await onRequested?.(getOptions(), key)

          setterStatus([local.signal, key], { load: !!onRequested })
        }
      }
    }),
  )

  const [state] = useAtomSystem(local.signal, { key: getKey })

  const [values, setValues] = createStore({
    skeleton: !state?.error && !!state?.load,
    error: !!state?.error,
    content: !state?.error && !state?.load,
  })

  createEffect(() => {
    if (state) {
      const skeleton = !state?.error && !!state?.load
      const error = !!state?.error
      const content = !state?.error && !state?.load

      setValues(
        produce((store) => {
          store.skeleton = skeleton
          store.error = error
          store.content = content

          return store
        }),
      )
    }
  })

  // return Suspense({
  //   fallback: context.Provider({
  //     value: {
  //       skeleton: true,
  //       error: false,
  //       content: false,
  //     },
  //     children: props.children,
  //   }),
  //   children: context.Provider({ value: values, children: props.children }),
  // })

  return (
    <Suspense
      fallback={
        <context.Provider
          value={{
            skeleton: true,
            error: false,
            content: false,
          }}
        >
          {props.children}
        </context.Provider>
      }
    >
      <context.Provider value={values}>{props.children}</context.Provider>
    </Suspense>
  )
}

SmartData.Content = Content
SmartData.Skeleton = Skeleton
SmartData.Error = Error

export default SmartData

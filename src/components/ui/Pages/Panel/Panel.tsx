import style from "./Panel.module.css"
import { createStore, produce } from "solid-js/store"
import { Container } from "./addons"
import PanelContext from "./Panel.context"

import { type JSX, type Component, mergeProps, splitProps } from "solid-js"
interface PanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /** Учитывать безопасную зону сверху */
  safeTop?: boolean

  /** Учитывать безопасную зону снизу */
  safeBottom?: boolean

  /** Учитывать безопасную зону слева */
  safeLeft?: boolean

  /** Учитывать безопасную зону справа */
  safeRight?: boolean
}

const Panel: Component<PanelProps> & {
  Container: typeof Container
} = (props) => {
  const merged = mergeProps(
    {
      safeTop: true,
      safeLeft: true,
      safeRight: true,
      safeBottom: false,
    },
    props,
  )

  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "safeTop",
    "safeBottom",
    "safeLeft",
    "safeRight",
  ])

  const [store, setStore] = createStore({
    isHeader: false,
    width: 0,
    height: 0,
  })

  const setSize = (width: number, height: number) => {
    setStore(
      produce((store) => {
        store.width = width
        store.height = height

        return store
      }),
    )
  }

  const getHeaderSize = () => {
    return {
      width: store.width,
      height: store.height,
    }
  }

  return (
    <div
      class={style.Panel}
      classList={{
        [style["Panel--header"]]: store.isHeader,

        [style["Panel__safe--top"]]: local.safeTop,
        [style["Panel__safe--bottom"]]: local.safeBottom,
        [style["Panel__safe--left"]]: local.safeLeft,
        [style["Panel__safe--right"]]: local.safeRight,

        [local.class || ""]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <PanelContext.Provider
        value={{
          setHeader: (status) => setStore("isHeader", status),
          getSafeZone: () => ({
            top: local.safeTop,
            bottom: local.safeBottom,
          }),
          setSize,
          getHeaderSize,
        }}
      >
        {local.children}
      </PanelContext.Provider>
    </div>
  )
}

Panel.Container = Container

export default Panel

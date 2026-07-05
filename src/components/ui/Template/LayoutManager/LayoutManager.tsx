import style from "./LayoutManager.module.css"
import { First, Last } from "./addons"

import { LayoutManagerStore } from "./context"
import toArray, { type ArrayJSX } from "../../utils/toArray"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  children,
  createEffect,
  on,
  createMemo,
  onMount,
} from "solid-js"
import { createStore, produce } from "solid-js/store"
import { Mutex } from "@minsize/mutex"

interface LayoutManager extends JSX.HTMLAttributes<HTMLDivElement> {
  key: string

  active: string
  elements: JSX.Element
  children: JSX.Element

  styles?: {
    next: string
    back: string
    firstIndex: string
    lastIndex: string
    firstElement: string
    lastElement: string
  }
  onAnimEnd?: () => void
}

type ComponentLayoutManager = Component<LayoutManager> & {
  First: typeof First
  Last: typeof Last
}

interface Store {
  lastVisible: boolean
  firstVisible: boolean
  lastType: "last" | "first"
  last: string
  first: string
  anim: boolean
  animEnd: {
    first: boolean
    last: boolean
  }
}

const LayoutManager: ComponentLayoutManager = (props) => {
  const [local, others] = splitProps(props, [
    "class",
    "classList",
    "children",
    "elements",
    "active",
    "styles",
    "onAnimEnd",
    "key",
  ])

  const panels = createMemo(() => toArray(children(() => local.elements)))
  const panelsObject = createMemo(() => {
    return panels().reduce(
      (acc, panel, index) => {
        acc[panel.nav] = { index, elem: panel }
        return acc
      },
      {} as Record<string, { index: number; elem: ArrayJSX<any> }>,
    )
  })

  const [store, setStore] = createStore<Store>({
    lastVisible: true,
    firstVisible: true,
    lastType: "first",
    last: "",
    first: "",
    anim: false,
    animEnd: {
      first: false,
      last: false,
    },
  })

  createEffect(
    on(
      () => local.active,
      (active) => {
        // if (active === prevActive) return

        setStore(
          produce((store) => {
            const isLastTypeFirst = store.lastType === "first"

            var _active = active

            for (const panel of panels()) {
              if (panel.getNav && panel.getNav(active)) {
                _active = panel.nav
              }
            }

            if (store[isLastTypeFirst ? "last" : "first"] === _active) {
              // setStore({
              //   [isLastTypeFirst ? "first" : "last"]: _active,
              //   [store.lastType === "first" ? "firstVisible" : "lastVisible"]:
              //     false,
              // })

              return store
            }

            store.firstVisible = true
            store.lastVisible = true

            store.lastType = isLastTypeFirst ? "last" : "first"
            store[isLastTypeFirst ? "first" : "last"] = _active
            store.anim = !!_active && !!panelsObject()[store[!isLastTypeFirst ? "first" : "last"]]
            store.animEnd = {
              first: false,
              last: false,
            }

            return store
          }),
        )
      },
    ),
  )

  const _direction = (type: "last" | "first"): "next" | "back" => {
    const backIndex = panelsObject()[store[type]]?.index
    const nextIndex = panelsObject()[store[type === "last" ? "first" : "last"]]?.index

    if (backIndex === undefined || nextIndex === undefined) {
      return "next"
    }

    return backIndex < nextIndex ? "next" : "back"
  }

  const direction = {
    first: createMemo(() => _direction("first")),
    last: createMemo(() => _direction("last")),
  }

  const getVisible = (type: "last" | "first") => store[`${type}Visible`]

  const getChild = (type: "first" | "last") => {
    if (getVisible(type)) {
      const page = panelsObject()[store[type]]
      return page?.elem
    }

    return undefined
  }

  const child = {
    first: createMemo(() => getChild("first")),
    last: createMemo(() => getChild("last")),
  }

  const getAnim = () => store.anim

  const onAnimationEnd = (type: "last" | "first") => {
    setStore("animEnd", type, true)

    if (store.animEnd.first && store.animEnd.last) {
      local.onAnimEnd?.()

      setStore({
        [store.lastType === "first" ? "firstVisible" : "lastVisible"]: false,
        anim: false,
      })
    }
  }

  const getDirection = (type: "last" | "first") => {
    return direction[type]()
  }

  const styleIndex = (type: "last" | "first") => {
    const isBack = direction[store.lastType]() === "back"
    const isLastType = store.lastType === type
    const isLast = isBack ? !isLastType : isLastType

    return {
      [local.styles?.firstIndex || "_firstIndex"]: isLast,
      [local.styles?.lastIndex || "_lastIndex"]: !isLast,
      [local.styles?.lastElement || "_lastElement"]: isLastType,
      ["_next"]: !isBack && store.anim,
      [local.styles?.firstElement || "_firstElement"]: !isLastType,
    }
  }

  return (
    <div
      class={style.LayoutManager}
      classList={{
        _TEST: true,
        [`${local.class}`]: !!local.class,
        ...local.classList,

        [String(local.styles?.[direction[store.lastType]()])]: store.anim,
      }}
      {...others}
    >
      <LayoutManagerStore.Provider
        value={{
          key: local.key,
          child,
          getDirection,
          onAnimationEnd,
          styleIndex,
          getAnim,
        }}
      >
        {local.children}
      </LayoutManagerStore.Provider>
    </div>
  )
}

LayoutManager.First = First
LayoutManager.Last = Last

export default LayoutManager

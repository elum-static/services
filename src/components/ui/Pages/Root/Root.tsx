import { styles } from "./styles"
import { Action, Path } from "./addons"

import useStyle from "@ui/utils/useStyle"
import usePlatform from "@ui/utils/usePlatform"
import LayoutManager from "@ui/Template/LayoutManager/LayoutManager"

import {
  type JSX,
  type Component,
  splitProps,
  createEffect,
  createMemo,
  onMount,
  onCleanup,
} from "solid-js"
import RootContext from "./RootContext"
import { createStore, produce } from "solid-js/store"
interface Root extends JSX.HTMLAttributes<HTMLDivElement> {
  activeView: string
  children: JSX.Element
  header?: JSX.Element

  footer?: JSX.Element
  footerVisible?: boolean

  modal?: JSX.Element
  popup?: JSX.Element
  snackbar?: JSX.Element | JSX.Element[]

  tabbar?: JSX.Element

  skipAnimations?: boolean
}

type ComponentRoot = Component<Root> & {
  Action: typeof Action
  Path: typeof Path
}

const Root: ComponentRoot = (props) => {
  const style = useStyle(styles)
  const [local, others] = splitProps(props, [
    "class",
    "classList",
    "activeView",
    "children",
    "modal",
    "popup",
    "tabbar",
    "snackbar",
    "header",
    "skipAnimations",

    "footer",
    "footerVisible",
  ])

  let refFooter: HTMLSpanElement

  const [store, setStore] = createStore({
    transitionRatio: 0,
    anim: false,

    footerHeight: 0,
  })

  const updateSize = () => {
    setStore(
      produce((store) => {
        store.anim = true
        store.footerHeight = refFooter!?.clientHeight || 0

        return store
      }),
    )
  }

  onMount(() => {
    updateSize()
    const resizeObserver = new ResizeObserver((entries) => {
      updateSize()
    })

    resizeObserver.observe(refFooter!)

    onCleanup(() => {
      resizeObserver.disconnect()
    })
  })

  const setTransitionRatio = (transitionRatio: number, anim: boolean = true) => {
    // requestAnimationFrame(() => {
    //   setStore("anim", anim)

    //   requestAnimationFrame(() => {
    //     setStore("transitionRatio", transitionRatio)
    //   })
    // })

    setStore({
      transitionRatio,
      anim,
    })
  }

  const platform = usePlatform()

  createEffect(() => {
    document.documentElement.setAttribute("platform", platform())
  })

  const getActive = () => {
    return local.activeView
  }

  const getSkipAnimation = () => !!local.skipAnimations

  const safeAreaInsetTop = () => {
    const style = getComputedStyle(document.documentElement)

    return {
      top: Number(style.getPropertyValue("--safe-area-inset-top").replace("px", "")),
      bottom: Number(style.getPropertyValue("--safe-area-inset-bottom").replace("px", "")),
      contentTop: Number(
        style.getPropertyValue("--content-safe-area-inset-top").replace("px", "") || 0,
      ),
    }
  }

  const getStyle = createMemo(() => {
    const area = safeAreaInsetTop()

    // console.log("area", area.globalBorderRadius)

    // const safeTop = (store.transitionRatio / 100) * area.top
    // const contextSafeTop = (store.transitionRatio / 100) * area.contentTop

    return {
      transform: `scale(${
        1 - (store.transitionRatio / 100) * 0.07
      }) translateY(calc(calc((${store.transitionRatio}/100) * ((${
        store.transitionRatio
      } / 100) * var(--safe-area-inset-top))) + ${
        (store.transitionRatio / 100) * 18
      }px)) translateZ(0)`,
      "border-radius":
        store.footerHeight >= 1
          ? `calc(var(--global-border-radius) * max(0.5, ${store.transitionRatio / 100})) calc(var(--global-border-radius) * max(0.5, ${store.transitionRatio / 100})) var(--global-border-radius) var(--global-border-radius)`
          : store.transitionRatio >= 1
            ? `calc(var(--global-border-radius) * max(0.5, ${store.transitionRatio / 100}))`
            : 0,
      transition: store.anim ? "0.3s ease-in-out" : "",
      "--root-animation": store.anim ? "0.3s ease-in-out" : "",
      "will-change": "bottom",
      // "margin-bottom": `${store.heightHeader}px`,
      // "--safe-area-inset-top": area.top - store.heightHeader + "px",
      // "-safe-area-inset-bottom": area.bottom + store.heightHeader + "px",
      // "bottom": `calc(${safeTop}px + ${contextSafeTop}px + (${store.transitionRatio} / 100 * var(--safe-area-inset-bottom)))`,
    }
  })

  return (
    <RootContext.Provider value={{ getActive, setTransitionRatio, getSkipAnimation }}>
      <LayoutManager
        key={"Root"}
        class={style.Root}
        classList={{
          _skipAnimations: local.skipAnimations,

          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        active={local.activeView}
        elements={local.children}
        styles={{
          firstIndex: style[`Root--index-1`],
          lastIndex: style[`Root--index-2`],
          firstElement: style[`Root--first`],
          lastElement: style[`Root--last`],
          next: style[`Root--to-next`],
          back: style[`Root--to-back`],
        }}
      >
        <div
          style={{
            "margin-bottom": `${local.footerVisible ? store.footerHeight : 0}px`,
            overflow: "hidden",
            position: "fixed",
            left: 0,
            right: 0,
            top: 0,
            bottom: 0,
            transition: "0.2s",
            "z-index": 2,
            "border-radius":
              (local.footerVisible ? store.footerHeight : 0) >= 1
                ? `calc(var(--global-border-radius) * max(0.5, ${store.transitionRatio / 100})) calc(var(--global-border-radius) * max(0.5, ${store.transitionRatio / 100})) var(--global-border-radius) var(--global-border-radius)`
                : 0,
          }}
        >
          <LayoutManager.Last
            // style={local.skipAnimations ? {} : getStyle()}
            class={style.Root__Container}
          />
          <LayoutManager.First
            // style={local.skipAnimations ? {} : getStyle()}
            class={style.Root__Container}
          />
          {local.popup}
          {local.modal}
          {local.tabbar}
          {local.snackbar}
        </div>

        <span ref={refFooter!} class={style.Root__header}>
          {local.footer}
        </span>
        {/* <Show when={!!local.popup} children={local.popup} /> */}
      </LayoutManager>
    </RootContext.Provider>
  )
}

Root.Action = Action
Root.Path = Path

export default Root

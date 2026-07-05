import { Component, Show, createEffect, on, onCleanup, onMount, splitProps } from "solid-js"
import { JSX } from "solid-js/jsx-runtime"
import { createStore } from "solid-js/store"

import style from "./ScrollOverflowItem.module.css"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"

interface ScrollOverflowItem extends JSX.HTMLAttributes<HTMLDivElement> {
  children: JSX.Element
  lastClassList: JSX.CustomAttributes<HTMLDivElement>["classList"]
  notLast: boolean
  contentRef: HTMLDivElement
  reverse?: boolean
  zIndex?: number
  scrollThreshold: number
  gap?: string
}

const ScrollOverflowItem: Component<ScrollOverflowItem> = (props) => {
  let ref: HTMLDivElement
  let refBottom: HTMLDivElement

  const [local, others] = splitProps(props, [
    "children",
    "lastClassList",
    "notLast",
    "contentRef",
    "reverse",
    "zIndex",
    "scrollThreshold",
    "gap",
  ])

  const [store, setStore] = createStore({
    height: (ref! && ref.offsetHeight) ?? 0,
    when: true,
  })

  const useVisibilityObserver = createVisibilityObserver({
    initialValue: false,
    // root: local.contentRef!,
  })
  const visibleBottom = useVisibilityObserver(() => refBottom!)

  // createEffect(() => {
  //   setStore("height", (height) =>
  //     height < (ref!?.clientHeight || 0) ? ref!?.clientHeight || 0 : height,
  //   )
  // })
  createEffect(
    on(visibleBottom, (visible) => {
      updateSize()
      setStore("when", visible)
    }),
  )

  const updateSize = () => {
    setStore("height", (height) => ref!?.offsetHeight || height)
  }

  onMount(() => {
    if (!ref!) return
    if (!refBottom!) return

    const observer = new MutationObserver(() => {
      updateSize()
    })

    observer.observe(ref, { childList: true, subtree: true })

    onCleanup(() => {
      observer.disconnect()
    })
  })

  return (
    <div
      class={style.ScrollOverflowItem}
      style={{
        height: !store.when ? (store.height > 0 ? store.height + "px" : "") : "",
        "min-height": !store.when ? (store.height > 0 ? store.height + "px" : "") : "",
        "z-index": local.zIndex,
      }}
      classList={{
        [`${others.class}`]: !!others.class,
        ...others.classList,
      }}
      {...others}
    >
      <div
        style={{
          gap: local.gap,
        }}
        class={style.ScrollOverflowItem__root}
        classList={local.lastClassList}
        ref={ref!}
      >
        <Show when={local.notLast && local.reverse}>
          <span />
        </Show>
        <Show when={store.when}>{local.children}</Show>
        {/* <Show when={local.notLast && !local.reverse}>
          <span />
        </Show> */}
      </div>
      <div
        ref={refBottom!}
        class={style.ScrollOverflowItem__bottom}
        style={{
          height: `calc(100% + ${local.scrollThreshold * 2}px)`,
          "margin-top": `-${local.scrollThreshold}px`,
        }}
      />
    </div>
  )
}

export default ScrollOverflowItem

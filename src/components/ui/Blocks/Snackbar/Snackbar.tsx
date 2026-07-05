import style from "./Snackbar.module.css"
import { type JSX, type Component, mergeProps, splitProps, createEffect, on } from "solid-js"

import { Root } from "./addons"
import Events, { GestureEvent, EventsProps } from "@ui/Template/Events/Events"
import { createStore, produce } from "solid-js/store"
import { elasticClamp } from "@minsize/utils"
import useSafeHeader from "@ui/utils/useSafeHeader"

interface Snackbar extends EventsProps<"button"> {
  position: "top" | "bottom"

  onClose: () => void

  onAnimEnd?: () => void
  isHidden?: () => boolean
}

type ComponentSnackbar = Component<Snackbar> & {
  Root: typeof Root
}

type Store = {
  position: {
    x: number
    y: number
  }
  close: {
    status: boolean
    position: "left" | "right" | "top" | "bottom"
  }
  anim: boolean
}

const Snackbar: ComponentSnackbar = (props) => {
  const merged = mergeProps({ position: "top" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "position",
    "onClose",
    "onAnimEnd",
    "isHidden",
  ])

  const safe = useSafeHeader()

  const [store, setStore] = createStore<Store>({
    position: {
      x: 0,
      y: 0,
    },
    close: {
      status: false,
      position: "left",
    },
    anim: true,
  })

  // onCleanup(() => {
  //   local.onClose()
  // })

  const onStart = (event: GestureEvent) => {
    setStore("anim", false)
  }

  const onMove = (event: GestureEvent) => {
    setStore(
      produce((store) => {
        store.anim = false

        if (event.isX) {
          store.position.x = elasticClamp(event.shiftX || 0, -100, 100)
        } else {
          store.position.y = elasticClamp(event.shiftY || 0, -25, 25, {
            threshold: 25,
            resistance: 0.1,
          })
        }

        return store
      }),
    )
  }

  const onEnd = (event: GestureEvent) => {
    const position = event.isX ? store.position.x : store.position.y

    setStore(
      produce((store) => {
        if (Math.abs(position) >= 25) {
          store.close.status = true

          if (event.isX) {
            store.close.position = position >= 0 ? "right" : "left"
          } else if (event.isY) {
            store.close.position = local.position === "bottom" ? "bottom" : "top"
          }
        }

        store.anim = true

        store.position.x = 0
        store.position.y = 0

        return store
      }),
    )
  }

  const onTransitionEnd: JSX.EventHandlerUnion<
    HTMLDivElement,
    TransitionEvent,
    JSX.EventHandler<HTMLDivElement, TransitionEvent>
  > = (event) => {
    if (event.target !== event.currentTarget) return

    if (!store.close.status) return

    local.onClose()
  }

  createEffect(
    on(
      () => local.isHidden?.(),
      (hidden) => {
        if (hidden) {
          setStore(
            produce((store) => {
              store.close.status = true

              store.close.position = local.position === "bottom" ? "bottom" : "top"

              store.anim = true

              store.position.x = 0
              store.position.y = 0

              return store
            }),
          )
        }
      },
    ),
  )

  return (
    <Events
      onStart={onStart}
      onMove={onMove}
      onEnd={onEnd}
      class={style.Snackbar}
      classList={{
        [style[`Snackbar__site--${safe.site}`]]: true,
        [style[`Snackbar__${store.close.position}--close`]]: store.close.status,
        [style[`Snackbar--anim`]]: store.anim,
        [style[`Snackbar__position--${local.position}`]]: !!local.position,

        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <div
        style={{
          transform: `translateX(${store.position.x}px) translateY(${store.position.y}px)`,
        }}
        class={style.Snackbar__in}
        onTransitionEnd={onTransitionEnd}
      >
        {local.children}
      </div>
    </Events>
  )
}

Snackbar.Root = Root

export default Snackbar

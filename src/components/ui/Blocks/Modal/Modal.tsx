import { styles } from "./styles"
import useStyle from "@ui/utils/useStyle"

import { createStore, produce } from "solid-js/store"
import { Root } from "./addons"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  onMount,
  createEffect,
  useContext,
  on,
  createMemo,
  Show,
  onCleanup,
} from "solid-js"
import ModalContext from "./ModalContext"
import { clamp, elasticClamp, isType } from "@minsize/utils"
import RootContext from "@ui/Pages/Root/RootContext"
import ModalRootContext from "@ui/Blocks/Modal/addons/Root/Root.context"
import useSafeHeader from "@ui/utils/useSafeHeader"
import combineStyle from "@ui/utils/combineStyle"
import Events, {
  isTouchSupport,
  type EventsProps,
  type GestureEvent,
} from "@ui/Template/Events/Events"

interface Modal extends Omit<EventsProps<"span">, "children"> {
  nav: string

  full?: boolean
  type?: "panel" | "card"

  onClose: () => void

  /**
   * Высота модального окна в частично открытом состоянии в процентах
   */
  partialHeight?: number

  children: ((params: { isFull: () => boolean }) => JSX.Element) | JSX.Element

  backgroundColor?: "primary" | "black" | "secondary"

  header?: JSX.Element
  footer?: JSX.Element

  "max-width"?: number | string
}

type ComponentModal = Component<Modal> & {
  Root: typeof Root
}

type Store = {
  startPosition: "middle" | "full"
  transformY: number
  anim: boolean
  startScroll: number
  contentHeight: number
  contentScroll: number

  /**
   * Указывает, что элемент прокручивается
   */
  isScrolling: boolean
}

const Modal: ComponentModal = (props) => {
  const style = useStyle(styles)

  const contextModalRoot = useContext(ModalRootContext)
  const contextRoot = useContext(RootContext)
  const merged = mergeProps(
    {
      type: "panel",
      partialHeight: 50,
      backgroundColor: "primary",
      "max-width": 480,
    },
    props,
  )
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "style",
    "onClose",
    "type",
    "partialHeight",
    "onClick",
    "full",
    "nav",
    "backgroundColor",
    "header",
    "footer",
    "max-width",
  ])

  var ref: HTMLDivElement

  const [store, setStore] = createStore<Store>({
    startPosition: "middle",
    transformY: 0,
    anim: false,
    startScroll: 0,

    isScrolling: false,

    contentHeight: 0,
    contentScroll: 0,
  })

  const safe = useSafeHeader()

  var partialHeight = createMemo(() => {
    return local.type === "card"
      ? 0
      : ((100 - (isTouchSupport ? local.partialHeight : 100)) / 100) * store.contentHeight
  })

  createEffect(
    on([() => ref!?.clientHeight || 0, () => ref!?.scrollHeight || 0], ([height, scroll]) => {
      setStore(
        produce((store) => {
          store.contentHeight = height
          store.contentScroll = scroll
          return store
        }),
      )

      setStore("transformY", partialHeight())
    }),
  )

  onMount(() => {
    if (!ref) return

    // Также отслеживаем мутации DOM
    const mutationObserver = new MutationObserver((entries) => {
      if (ref.scrollHeight !== store.contentScroll) {
        setStore("contentScroll", ref.scrollHeight)
      }
    })
    mutationObserver.observe(ref, {
      childList: true,
      subtree: true,
      characterData: true,
    })

    onCleanup(() => mutationObserver.disconnect())
  })

  const getIsFull = createMemo(() => {
    if (local.partialHeight >= 100 && local.full) return true
    return store.transformY <= 5 && !!local.full && store.contentScroll > store.contentHeight
  })

  const onStartY = (event: GestureEvent) => {
    if (!isTouchSupport) return
    setStore("startScroll", ref.scrollTop)
  }

  const _elasticClamp = (value: number, max: number) => {
    if (store.transformY === 0 && store.contentScroll > store.contentHeight) {
      return clamp(value, 0, max)
    }

    return elasticClamp(value, 0, max, { threshold: 50, resistance: 0.2 })
  }

  const onMoveY = (event: GestureEvent) => {
    if (!isTouchSupport) return
    if (ref.scrollTop !== 0 || store.isScrolling) {
      return
    }
    setStore(
      produce((store) => {
        const shiftY = (event.shiftY || 0) - store.startScroll

        if (store.startPosition === "full") {
          store.transformY = _elasticClamp(shiftY, store.contentHeight)
        } else {
          store.transformY = _elasticClamp(partialHeight() + shiftY, store.contentHeight)
        }

        if (local.type === "card") {
          const ratio =
            100 -
            elasticClamp(store.transformY / 5, 0, 100, {
              resistance: 1,
            })

          if (!contextModalRoot?.onClose(local.nav)) {
            contextRoot?.setTransitionRatio(ratio, false)
          }
        } else {
          if (!local.full) {
            const ratio = 100 - clamp((store.transformY / partialHeight()) * 100, 0, 100)

            if (store.contentScroll > store.contentHeight) {
              if (!contextModalRoot?.onClose(local.nav)) {
                contextRoot?.setTransitionRatio(ratio, false)
              }
            }
          }
        }

        store.anim = false
        return store
      }),
    )
  }

  const onEndY = (event: GestureEvent) => {
    if (!isTouchSupport) return
    if (ref.scrollTop !== 0 || store.isScrolling) {
      return
    }

    setStore(
      produce((store) => {
        const { shiftY = 0, shiftYAbs = 0 } = event
        const absoluteShift = shiftYAbs - store.startScroll
        const isTopDirection = shiftY < 0
        var shouldClose = shiftYAbs >= 50

        // Закрываем если сдвинули достаточно далеко вниз
        if (!isTopDirection && shouldClose && store.startPosition !== "full") {
          store.transformY = partialHeight()
          store.startPosition = "middle"
          onClose()
        } else {
          if (isTopDirection) {
            if (absoluteShift >= 25 || store.startPosition === "full") {
              store.transformY = 0
              store.startPosition = local.type === "card" ? "middle" : "full"
            } else {
              store.transformY = partialHeight()
              store.startPosition = "middle"
            }
          } else {
            if (absoluteShift >= 25 || store.startPosition === "middle") {
              store.transformY = partialHeight()
              store.startPosition = "middle"
            } else {
              store.transformY = 0
              store.startPosition = local.type === "card" ? "middle" : "full"
            }
          }
          if (shiftY >= 25 && event.isFast && store.startPosition !== "full") {
            onClose()
          }
        }

        if (!local.full) {
          if (local.type === "card" || store.contentScroll > store.contentHeight) {
            if (!contextModalRoot?.onClose(local.nav)) {
              contextRoot?.setTransitionRatio(100 - clamp(store.transformY, 0, 100), true)
            }
          }
        }

        // Обновляем store
        store.startScroll = 0
        store.anim = true

        return store
      }),
    )
  }

  const onClose = () => {
    local.onClose()
  }

  onMount(() => {
    if (local.type === "card") {
      contextRoot?.setTransitionRatio(100, true)
    }
  })

  createEffect(
    on(
      () => contextModalRoot?.onClose(local.nav),
      (status) => {
        if (status) {
          contextRoot?.setTransitionRatio(0, true)
        }
      },
      {
        defer: true,
      },
    ),
  )

  return (
    <Events
      component={"span"}
      class={style.Modal}
      classList={{
        [style[`Modal__backgroundColor--${local.backgroundColor}`]]: !!local.backgroundColor,
        [style[`Modal__type--${local.type}`]]: !!local.type,
        [style[`Modal--maxFull`]]: local.full,
        [style[`Modal--full`]]: getIsFull(),
        [style[`Modal--anim`]]: store.anim,
        [style[`Modal__site--${safe.site}`]]: !!safe.site,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onClick={onClose}
      onStartY={onStartY}
      onMoveY={onMoveY}
      onEndY={onEndY}
      restoreFocus
      tappable={false}
      {...others}
      style={combineStyle(local.style, {
        "--transformY": store.transformY + "px",
      })}
    >
      {local.header}
      <div
        onClick={(e) => {
          e.preventDefault()
          e.stopPropagation()
        }}
        class={style.Modal__container}
        classList={{
          [style["Modal--overflow"]]: store.transformY !== 0,
        }}
        style={{
          transform: `translateY(${store.transformY}px)`,
          "max-width": !!local["max-width"]
            ? typeof local["max-width"] === "number"
              ? local["max-width"] + "px"
              : local["max-width"]
            : "",
          // "min-height": `${local.partialHeight}%`,
        }}
      >
        <div
          ref={ref!}
          onScroll={(event) => {
            if ("onscrollend" in window) {
              setStore("isScrolling", true)
            }
          }}
          onScrollEnd={(event) => {
            setStore("isScrolling", false)
          }}
          class={style.Modal__container_in}
        >
          <ModalContext.Provider
            value={{
              getIsFull,
            }}
          >
            <Show keyed when={local.children}>
              {(children) =>
                isType(children, "function")
                  ? (children as Function)({ isFull: getIsFull })
                  : children
              }
            </Show>
          </ModalContext.Provider>
        </div>
        <Show keyed when={local.footer}>
          {(footer) => (
            <div
              style={{
                "max-width": !!local["max-width"]
                  ? typeof local["max-width"] === "number"
                    ? local["max-width"] + "px"
                    : local["max-width"]
                  : "",
              }}
              class={style.Modal__footer}
            >
              {footer}
            </div>
          )}
        </Show>
      </div>
    </Events>
  )
}

Modal.Root = Root

export default Modal

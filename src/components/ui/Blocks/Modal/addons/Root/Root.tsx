import { createStore } from "solid-js/store"
import style from "./Root.module.css"
import { Path } from "./addons"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  Show,
  children,
  createEffect,
  For,
  Suspense,
} from "solid-js"
import toArray from "@ui/utils/toArray"
import RootContext from "./Root.context"
import { PathProps } from "./addons/Path/Path"

interface Root extends JSX.HTMLAttributes<HTMLDivElement> {
  activeModal: string
}

type ComponentRoot = Component<Root> & {
  Path: typeof Path
}

const Root: ComponentRoot = (props) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "activeModal",
    "onTransitionEnd",
  ])

  const [store, setStore] = createStore({
    active: local.activeModal,
    to: "up",
    hidden: true,
    anim: false,
    clear: !local.activeModal,
  })

  const childs = toArray<PathProps>(children(() => local.children))

  createEffect(() => {
    if (!store.anim) {
      //* Открытие модалки */
      if (!store.active && !!local.activeModal) {
        setStore({
          to: "up",
          active: local.activeModal,
          anim: true,
          clear: false,
          hidden: false,
        })
      }

      //* Закрываем модалку */
      if (!!store.active && !local.activeModal) {
        setStore({
          to: "down",
          anim: true,
          clear: false,
          hidden: false,
        })
      }

      //* Смена модалки */
      if (store.active != local.activeModal) {
        setStore({
          to: "down",
          anim: true,
          clear: false,
          hidden: false,
        })
      }

      if (
        !!store.active &&
        !!local.activeModal &&
        store.active === local.activeModal
      ) {
        setStore({
          to: "up",
          active: local.activeModal,
          anim: false,
          clear: false,
          hidden: false,
        })
      }
    }
  })

  const handlerSwap = (event: any) => {
    if (store.to === "down") {
      setStore({
        active: local.activeModal,
        anim: false,
        clear: !local.activeModal,
      })
    }
    if (store.to === "up") {
      setStore({
        anim: false,
      })
    }
  }

  const onTransitionEnd: JSX.EventHandlerUnion<
    HTMLDivElement,
    TransitionEvent
  > = (event) => {
    ;(local?.onTransitionEnd as any)?.(event)
    // Проверяем, что событие произошло на корневом элементе
    if (event.target !== event.currentTarget) return

    setStore({
      hidden: !local.activeModal,
    })
  }

  const onClose = (nav: string) => {
    return local.activeModal !== nav
  }

  return (
    <div
      class={style.Root}
      classList={{
        [style["Root--to-up"]]: store.to === "up",
        [style["Root--to-down"]]: store.to === "down",
        [style["Root--show"]]: !local.activeModal,
        [style["Root--hidden"]]: store.hidden,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onTransitionEnd={onTransitionEnd}
      {...others}
    >
      <RootContext.Provider
        value={{
          onClose,
        }}
      >
        <For
          each={childs}
          children={(element) => (
            <Show when={element.nav === store.active}>
              <div
                data-name={element.nav}
                class={style.Root__container}
                onAnimationEnd={handlerSwap}
              >
                <Suspense fallback={element.fallback?.({ nav: element.nav })}>
                  {element.component({ nav: element.nav })}
                </Suspense>
              </div>
            </Show>
          )}
        />
      </RootContext.Provider>
    </div>
  )
}

Root.Path = Path

export default Root

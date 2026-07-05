import { createStore } from "solid-js/store"
import style from "./Modal.module.css"
import { Content } from "./addons"

import { type JSX, type Component, mergeProps, splitProps, Show, createEffect, on } from "solid-js"
import Events, { type EventsProps } from "@ui/Template/Events/Events"

interface ModalProps extends EventsProps<"button"> {
  /**
   * Флаг открытия/закрытия модалки
   * @default false
   */
  open?: boolean

  /**
   * Коллбэк при закрытии
   */
  onClose?: () => void
}

type ComponentModal = Component<ModalProps> & {
  Content: typeof Content
}

type Store = {
  hidden: boolean
}

const Modal: ComponentModal = (props) => {
  const merged = mergeProps({ open: false }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "open",
    "onClose",
    "onTransitionEnd",
  ])

  const [store, setStore] = createStore<Store>({ hidden: local.open })

  createEffect(
    on(
      () => local.open,
      (open) => {
        if (open) setStore("hidden", open)
      },
      { defer: true },
    ),
  )

  const onTransEnd: JSX.EventHandlerUnion<HTMLDivElement, TransitionEvent> = (event) => {
    ;(local.onTransitionEnd as any)?.(event)
    // Проверяем, что событие произошло на корневом элементе
    if (event.target !== event.currentTarget) return

    setStore("hidden", local.open)
  }

  return (
    <Events
      onClick={local.onClose}
      class={style.Modal}
      classList={{
        [style["Modal--open"]]: local.open,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      onTransitionEnd={onTransEnd}
      {...others}
      role="dialog" // Добавляем ARIA-роль для доступности
      aria-hidden={!local.open} // ARIA-атрибут видимости
    >
      <div
        onClick={(event) => {
          event.stopPropagation()
        }}
        class={style.Modal__in}
      >
        <Show when={store.hidden}>{local.children}</Show>
      </div>
    </Events>
  )
}

Modal.Content = Content

export default Modal

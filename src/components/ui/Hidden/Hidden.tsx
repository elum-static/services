import { createStore } from "solid-js/store"
import style from "./Hidden.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  Show,
  onMount,
  onCleanup,
  createMemo,
  untrack,
  createEffect,
  on,
  useContext,
} from "solid-js"
import { unlink } from "@minsize/utils"
import createHandler from "@ui/utils/createHandler"
import combineStyle from "@ui/utils/combineStyle"
import PanelContext from "@ui/Pages/Panel/Panel.context"

type RequiredParameter<T> = T extends () => unknown ? never : T

interface Hidden<T, TRenderFunction extends (item: NonNullable<T>) => JSX.Element> extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "children"
> {
  when: T | undefined | null | false
  children: JSX.Element | RequiredParameter<TRenderFunction>

  safeHeader?: boolean

  anim?: boolean
}

type Store<T> = {
  height: number
  safeWhen: T | undefined | null | false
}

const Hidden = <T, TRenderFunction extends (item: NonNullable<T>) => JSX.Element>(
  props: Hidden<T, TRenderFunction>,
): JSX.Element => {
  const contextPanel = useContext(PanelContext)

  const merged = mergeProps({ anim: true }, props) as Hidden<T, TRenderFunction>
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "when",
    "anim",
    "onTransitionEnd",
    "style",

    "safeHeader",
  ])

  let ref: HTMLSpanElement

  const [store, setStore] = createStore<Store<T>>({
    height: 0,
    safeWhen: undefined,
  })

  const updateSize = () => {
    setStore("height", (height) => ref!?.offsetHeight || height)
  }

  onMount(() => {
    if (!ref!) return

    updateSize()
    const observer = new MutationObserver(() => {
      updateSize()
    })

    observer.observe(ref, { childList: true, subtree: true })

    onCleanup(() => {
      observer.disconnect()
    })
  })

  createEffect(
    on(
      () => local.when,
      (when, prev) => {
        if (!when && prev) {
          setStore("safeWhen", prev)
        }
      },
    ),
  )

  const onTransitionEnd = createHandler((event) => {
    // Проверяем, что событие произошло на корневом элементе
    if (event.target !== event.currentTarget) return

    setStore("safeWhen", undefined)
  }, local.onTransitionEnd)

  return (
    <div
      class={style.Hidden}
      classList={{
        [style[`Hidden--anim`]]: !!local.anim,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
      style={combineStyle(
        {
          height: !!local.when ? store.height + "px" : "",
          opacity: !!local.when ? 1 : "",
        },
        local.style,
      )}
      onTransitionEnd={onTransitionEnd}
    >
      <span
        ref={ref!}
        class={style.Hidden__content}
        // style={{
        //   "padding-top": `${contextPanel?.getHeaderSize().height || 0}px`,
        // }}
      >
        <Show when={local.when || store.safeWhen} keyed children={local.children} />
      </span>
    </div>
  )
}

export default Hidden

import { createStore, produce } from "solid-js/store"
import style from "./Picker.module.css"
import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  createEffect,
  For,
  Show,
  on,
} from "solid-js"
import { debounce } from "@solid-primitives/scheduled"
import Flex from "@ui/Template/Flex/Flex"
import { IconChevronDown } from "src/source"
import Button from "@ui/Blocks/Button/Button"
import { clamp } from "@minsize/utils"
import { isTouchSupport } from "@ui/Template/Events/Events"

interface Picker<Options extends Object> extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  step: number
  options: Array<
    Options & {
      id: number
      title: string
    }
  >
  defaultId: number
  onChange: (
    option: Options & {
      id: number
      title: string
    },
  ) => void

  header?: JSX.Element
}

const Picker = <Options extends Object>(props: Picker<Options>) => {
  const merged = mergeProps({}, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "step",
    "options",
    "defaultId",
    "onChange",
    "header",
  ])

  var ref: HTMLSpanElement
  var refScrollContent: HTMLDivElement

  function rotateX(scroll: number, index: number) {
    // Центральный индекс (середина диапазона)
    const center = scroll / store.blockHeight

    // Вычисляем значение относительно центра
    return (center - index) * local.step
  }

  const [store, setStore] = createStore({
    scroll: 0,
    blockHeight: 0,
    anim: false,
    animTouch: false,
    lastOptionId: 0,
    touched: false,
  })

  const update = () => {
    setStore(
      produce((store) => {
        store.anim = false
        store.blockHeight = ref!?.clientHeight

        var rotate =
          local.defaultId *
          store.blockHeight *
          (((local.options.length - 1) * local.step) /
            ((local.options.length - 1) * store.blockHeight))

        store.scroll = rotate

        return store
      }),
    )

    setTimeout(() => {
      refScrollContent.scrollTop = store.blockHeight * local.defaultId
    }, 1)
  }

  createEffect(
    on(
      () => local.defaultId,
      (next, prev) => {
        if (next === store.lastOptionId) return
        update()
      },
    ),
  )

  const isVisible = (index: number) => {
    const count = Math.ceil(refScrollContent.offsetHeight / store.blockHeight / 2) || 5
    const currentIndex = store.scroll / local.step
    return Math.abs(currentIndex - index) <= count
  }

  const onScrollEnd: JSX.EventHandlerUnion<
    HTMLDivElement,
    Event,
    JSX.EventHandler<HTMLDivElement, Event>
  > = (event) => {
    if (!("onscrollend" in window)) {
      if (store.touched) return
    }

    const index = Number((store.scroll / local.step).toFixed(0))

    var rotate =
      index *
      store.blockHeight *
      (((local.options.length - 1) * local.step) / ((local.options.length - 1) * store.blockHeight))

    setStore(
      produce((store) => {
        store.animTouch = false
        store.anim = true

        store.scroll = rotate

        return store
      }),
    )

    const option = local.options[index]
    if (option) {
      setStore("lastOptionId", option.id)
      local.onChange(option)
    }
  }

  const onScrollEndDebounce = debounce(onScrollEnd, 300)

  const onScroll: JSX.EventHandlerUnion<
    HTMLDivElement,
    Event,
    JSX.EventHandler<HTMLDivElement, Event>
  > = (event) => {
    var rotate =
      event.target.scrollTop *
      (((local.options.length - 1) * local.step) /
        (event.target.scrollHeight - event.target.clientHeight))
    setStore(
      produce((store) => {
        store.animTouch = true
        store.anim = false

        store.scroll = rotate

        return store
      }),
    )

    if (!("onscrollend" in window)) {
      onScrollEndDebounce.clear()
      onScrollEndDebounce(event)
    }
  }

  const isSelected = (index: number) => {
    const currentPosition = store.scroll / local.step
    const targetPosition = index
    return Math.abs(currentPosition - targetPosition) * local.step <= 15
  }

  const go = (type: "next" | "back") => {
    var currentIndex = store.scroll / local.step

    if (type === "next") {
      currentIndex = clamp(currentIndex - 1, 0, local.options.length - 1)
    } else if (type === "back") {
      currentIndex = clamp(currentIndex + 1, 0, local.options.length - 1)
    }

    // var rotate =
    //   currentIndex *
    //   store.blockHeight *
    //   (((local.options.length - 1) * local.step) /
    //     ((local.options.length - 1) * store.blockHeight))

    refScrollContent.scrollTop = store.blockHeight * currentIndex

    // setStore(
    //   produce((store) => {
    //     store.animTouch = false
    //     store.anim = true

    //     store.scroll = rotate

    //     return store
    //   }),
    // )
  }

  return (
    <div
      class={style.Picker}
      classList={{
        [style["Picker--anim"]]: store.anim,
        [style["Picker--animTouch"]]: store.animTouch,
        [`${local.class}`]: !!local.class,
        ...local.classList,
      }}
      {...others}
    >
      <Show keyed when={local.header}>
        {(header) => <span class={style.Picker__header}>{header}</span>}
      </Show>
      <div class={style.Picker__content}>
        <div
          ref={refScrollContent!}
          class={style.Picker__fakeScroll}
          onTouchStart={() => {
            onScrollEndDebounce.clear()
            setStore("touched", true)
          }}
          onTouchMove={() => {
            onScrollEndDebounce.clear()
          }}
          onTouchEnd={(event) => {
            if (!("onscrollend" in window)) {
              onScrollEndDebounce(event)
            }
            setStore("touched", false)
          }}
          onScroll={onScroll}
          onScrollEnd={(event) => {
            onScrollEndDebounce.clear()
            onScrollEnd(event)
          }}
        >
          <span
            class={style.Picker__fakeScroll_content}
            style={{
              height: (local.options.length + 6) * store.blockHeight + "px",
            }}
          />
        </div>
        <Flex
          class={style.Picker__days}
          style={{
            transform: `translate3d(0px, 0px, -100px) rotateX(${store.scroll}deg)`,
          }}
        >
          <span
            ref={ref!}
            class={style.Picker__day}
            classList={{ [style["Picker--hidden"]]: true }}
          >
            hidden
          </span>
          <For each={local.options}>
            {(option, index) => (
              <Show when={isVisible(index())}>
                <span
                  style={{
                    // top: `${(store.blockHeight / 2) * -1}px`,
                    transform: `rotateX(${rotateX(0, index())}deg) translate3d(0px, 0px, 100px)`,
                    // opacity: opacity(store.scroll.day, index()),
                  }}
                  class={style.Picker__day}
                  classList={{
                    [style["Picker__day--selected"]]: isSelected(index()),
                  }}
                >
                  {option.title}
                </span>
              </Show>
            )}
          </For>
        </Flex>
        <div class={style.Picker__input}>
          <Flex
            class={style.Picker__input__in}
            style={{
              transform: `translate3d(0px, 0px, -100px) rotateX(${store.scroll}deg)`,
            }}
          >
            <For each={local.options}>
              {(option, index) => (
                <Show when={isVisible(index())}>
                  <span
                    style={{
                      top: `${(store.blockHeight / 2) * -1}px`,
                      transform: `rotateX(${rotateX(0, index())}deg) translate3d(0px, 0px, 100px)`,
                      // opacity: opacity(store.scroll.day, index()),
                    }}
                    class={style.Picker__input__item}
                  >
                    {option.title}
                  </span>
                </Show>
              )}
            </For>
          </Flex>
        </div>
      </div>
      <Show when={!isTouchSupport}>
        <div class={style.Picker__button_up}>
          <Button
            onClick={() => go("next")}
            type={"icon"}
            size={"small"}
            mode={"soft"}
            appearance={"secondary"}
          >
            <Button.Content>
              <IconChevronDown
                style={{
                  transform: "rotateX(180deg)",
                }}
              />
            </Button.Content>
          </Button>
        </div>
        <div class={style.Picker__button_down}>
          <Button
            onClick={() => go("back")}
            type={"icon"}
            size={"small"}
            mode={"soft"}
            appearance={"secondary"}
          >
            <Button.Content>
              <IconChevronDown />
            </Button.Content>
          </Button>
        </div>
      </Show>
    </div>
  )
}

export default Picker

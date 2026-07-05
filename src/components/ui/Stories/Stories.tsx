import style from "./Stories.module.css"

import {
  type JSX,
  type Component,
  mergeProps,
  splitProps,
  For,
  Show,
  createEffect,
  on,
} from "solid-js"
import { createStore, produce } from "solid-js/store"
import combineStyle from "@ui/utils/combineStyle"
import { clamp, elasticClamp } from "@minsize/utils"
import StoriesContext from "./Stories.context"
import Flex from "@ui/Template/Flex/Flex"
import Button from "@ui/Blocks/Button/Button"
import { IconChevronLeft, IconChevronRight } from "src/source"
import { StoryContentItem } from "@ui/Blocks/Story/Story"

import Events, { type GestureEvent, isTouchSupport } from "@ui/Template/Events/Events"
import Badge from "@ui/Blocks/Badge/Badge"

interface Stories<Each extends StoryContentItem> extends Omit<
  Omit<JSX.HTMLAttributes<HTMLDivElement>, "children">,
  "onClick"
> {
  each: Each[][]

  children: (item: Each[], index: () => number) => JSX.Element

  onClose?: () => void

  /**
   * Отображение количество контента
   * @default false
   */
  counter?: boolean

  selected?: number

  type?: "stories" | "gallery"
}

type Store = {
  transformX: number
  position: number
  anim: boolean
  visible: {
    from: number
    to: number
  }
  positions: Record<number, number>
}

const Stories = <Each extends StoryContentItem>(props: Stories<Each>) => {
  const merged = mergeProps({ counter: false, selected: 0, type: "stories" }, props)
  const [local, others] = splitProps(merged, [
    "class",
    "classList",
    "children",
    "style",
    "each",
    "onClose",
    "counter",
    "selected",
    "type",
  ])

  var ref: HTMLDivElement

  const ATEST = 2

  const START_INDEX = 0

  const [store, setStore] = createStore<Store>({
    transformX: 0,
    position: 0,
    anim: false,
    visible: {
      from: START_INDEX,
      to: START_INDEX + ATEST,
    },
    positions: {},
  })

  createEffect(
    on([() => local.selected, () => local.each], ([next]) => {
      setStore(
        produce((store) => {
          store.position = next

          if (local.each[store.position] === undefined) {
            local.onClose?.()
            store.position = clamp(store.position, 0, local.each.length - 1)
          }

          store.visible.from = clamp(store.position - ATEST, 0, local.each.length)
          store.visible.to = clamp(store.position + ATEST, 0, local.each.length)

          store.anim = false

          if (!store.positions[store.position]) {
            store.positions[store.position] = 0
          }
          const content = local.each[store.position]
          if (!content) {
            store.positions[store.position] = 0
          }

          return store
        }),
      )
    }),
  )

  const go = (type: "next" | "back", anim = false) => {
    setStore(
      produce((store) => {
        store.position = type === "next" ? store.position + 1 : store.position - 1

        if (local.each[store.position] === undefined) {
          local.onClose?.()
          store.position = clamp(
            type === "next" ? store.position + 1 : store.position - 1,
            0,
            local.each.length - 1,
          )
        }

        store.visible.from = clamp(store.position - ATEST, 0, local.each.length)
        store.visible.to = clamp(store.position + ATEST, 0, local.each.length)

        store.anim = anim

        return store
      }),
    )
  }

  const goStory = (type: "next" | "back") => {
    setStore(
      produce((store) => {
        if (!store.positions[store.position]) {
          store.positions[store.position] = 0
        }

        if (type === "next") {
          const content = local.each[store.position]
          store.positions[store.position] += 1
          if (store.positions[store.position] > content.length - 1) {
            store.positions[store.position] = content.length - 1
            go("next", true)
          }
        } else {
          store.positions[store.position] -= 1
          if (store.positions[store.position] < 0) {
            store.positions[store.position] = 0
            go("back", true)
          }
        }

        return store
      }),
    )
  }

  const getBoundsForPosition = (position: number, total: number, clientHeight: number) => {
    const fullRange = clientHeight * (total - 1)

    if (position === 0) {
      return { min: -fullRange, max: 0 }
    } else if (position === total - 1) {
      return { min: 0, max: fullRange }
    } else {
      return { min: -fullRange, max: fullRange }
    }
  }

  const onMoveX = (event: GestureEvent) => {
    const shiftX = event.shiftX || 0

    const target = event.originalEvent.currentTarget as HTMLDivElement

    setStore(
      produce((store) => {
        const bounds = getBoundsForPosition(store.position, local.each.length, target.clientHeight)
        store.transformX = elasticClamp(shiftX, bounds.min, bounds.max, {
          threshold: 50,
          resistance: 0.2,
        })

        store.anim = false

        return store
      }),
    )
  }

  const onEndX = (event: GestureEvent) => {
    setStore(
      produce((store) => {
        if ((event.shiftXAbs || 0) >= 25) {
          const isLeft = (event.shiftX || 0) <= 0

          go(isLeft ? "next" : "back")
        }

        store.transformX = 0
        store.anim = true

        return store
      }),
    )
  }

  const onTransitionEnd: JSX.EventHandlerUnion<HTMLDivElement, TransitionEvent> = (event) => {
    if (event.target !== event.currentTarget) return

    setStore("anim", false)
  }

  const getStorySelect = (position: number) => store.positions[position]

  return (
    <div
      class={style.Stories__container}
      classList={{
        [`_Stories__type--${local.type}`]: !!local.type,
        [style[`Stories__type--${local.type}`]]: !!local.type,
        [style["Stories--touch"]]: isTouchSupport,
      }}
    >
      <Events
        ref={ref!}
        class={style.Stories}
        classList={{
          [style[`Stories--anim`]]: store.anim,

          [`${local.class}`]: !!local.class,
          ...local.classList,
        }}
        {...(isTouchSupport ? { onMoveX, onEndX } : {})}
        stopPropagation={false}
        preventDefault={false}
        onTransitionEnd={onTransitionEnd}
        style={combineStyle(local.style, {
          transform: `translateX(calc(${
            ref!?.clientWidth * store.position * -1 + store.transformX
          }px)`,

          "--stories_transition_ratio": elasticClamp(
            Math.abs(store.transformX / window.innerWidth),
            0,
            1,
          ),
        })}
        {...others}
      >
        <div
          class={style.Stories__fallback}
          style={{
            width: `${store.visible.from * 100}%`,
            "min-width": `${store.visible.from * 100}%`,
          }}
        />
        <For each={local.each.slice(store.visible.from, store.visible.to + 1)}>
          {(elem, index) => {
            const indexed = index() + store.visible.from

            return (
              <div
                class={style.Stories__Item}
                classList={{
                  [style[
                    `Stories__Item__position--${
                      indexed === store.position
                        ? "center"
                        : indexed === store.position - 1
                          ? "left"
                          : indexed === store.position + 1
                            ? "right"
                            : indexed < store.position - 1
                              ? "hidden--left"
                              : "hidden--right"
                    }`
                  ]]: true,

                  [`${local.class}`]: !!local.class,
                  ...local.classList,
                }}
                {...others}
              >
                <StoriesContext.Provider
                  value={{
                    getAccent: () => indexed === store.position,
                    goNext: () => go("next", true),
                    goBack: () => go("back", true),
                    goStory,
                    getStorySelect: () => getStorySelect(store.visible.from + index()),
                    getAnimation: () => store.anim,
                    getCounter: () => !!local.counter && local.type !== "gallery",
                    getIndex: () =>
                      local.each.slice(0, store.visible.from + index()).reduce((acb, item) => {
                        return acb + (item || []).length
                      }, 0),
                    getContentLength: () =>
                      local.each.reduce((acb, item) => {
                        return acb + (item || []).length
                      }, 0),
                  }}
                >
                  {local.children(elem, () => indexed)}
                </StoriesContext.Provider>
              </div>
            )
          }}
        </For>
      </Events>
      <Show when={local.counter && local.type === "gallery"}>
        <Flex direction={"row"} class={style.Stories__counter}>
          <For each={Array.from({ length: local.each.length })}>
            {(_, index) => (
              <Badge
                class={style.Stories__counter_item}
                padding={"compact"}
                bgColor={store.position === index() ? "accent" : "sp-primary"}
              />
            )}
          </For>
        </Flex>
      </Show>
      <Show when={store.position !== 0}>
        <Events
          onClick={() => {
            goStory("back")
          }}
          class={style.Stories__button_back}
        >
          <Button
            disabled={false}
            class={style.Stories__button_control}
            type={"icon"}
            border={"pill"}
            appearance={"secondary"}
            mode={"soft"}
          >
            <Button.Content>
              <IconChevronLeft />
            </Button.Content>
          </Button>
        </Events>
      </Show>
      <Show when={store.position !== (local.each || []).length - 1}>
        <Events
          onClick={() => {
            goStory("next")
          }}
          class={style.Stories__button_next}
        >
          <Button
            disabled={false}
            class={style.Stories__button_control}
            type={"icon"}
            border={"pill"}
            appearance={"secondary"}
            mode={"soft"}
          >
            <Button.Content>
              <IconChevronRight />
            </Button.Content>
          </Button>
        </Events>
      </Show>
    </div>
  )
}

export default Stories

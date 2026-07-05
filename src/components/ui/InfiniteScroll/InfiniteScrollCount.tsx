import style from "./InfiniteScroll.module.css"

import {
  type Accessor,
  type JSX,
  createEffect,
  createMemo,
  For,
  Match,
  mergeProps,
  on,
  Show,
  Switch,
} from "solid-js"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"

import Plug from "@ui/Blocks/Plug/Plug"
import Spinner from "@ui/Blocks/Spinner/Spinner"

import ScrollOverflowItem from "./ScrollOverflowItem"
import { createStore } from "solid-js/store"
import { clamp } from "@minsize/utils"

type InfiniteScroll<T, U> = {
  each: T[] | undefined
  children: (item: T, index: Accessor<number>) => U
  next: () => Promise<unknown>
  hasMore: boolean | ((countElements: number) => boolean)
  loadingMessage?: JSX.Element
  endMessage?: JSX.Element
  scrollThreshold?: number

  count?: number

  reverse?: boolean

  gap?: string

  sort?: "DESC" | "ASC"
}

type Store = {
  isLoading: boolean

  count: number
  fakeHasMore: boolean
}

function InfiniteScroll<T extends unknown, U extends JSX.Element>(props: InfiniteScroll<T, U>) {
  let contentRef: HTMLDivElement
  let observerRef: HTMLDivElement

  const merged = mergeProps({ scrollThreshold: 300, reverse: false, count: 10, sort: "ASC" }, props)

  const getLength = createMemo(() => Math.ceil((props.each || [])?.length / merged.count))

  const [store, setStore] = createStore<Store>({
    isLoading: false,

    count: merged.sort === "DESC" ? clamp(getLength() - 1, 0, getLength()) : 1,
    fakeHasMore: false,
  })

  const useVisibilityObserver = createVisibilityObserver({
    initialValue: false,
    root: contentRef!,
  })
  const visibleObserver = useVisibilityObserver(() => observerRef!)

  const isHasMore = () => {
    if (typeof props.hasMore === "function") {
      return props.hasMore(getLength() * merged.count)
    }

    return !!props.hasMore
  }

  const handleNext = async () => {
    if (!isHasMore()) {
      if (merged.sort === "DESC" && store.count <= 0) {
        return
      }
      if (merged.sort === "ASC" && store.count >= getLength()) {
        return
      }
    }
    try {
      setStore("isLoading", true)

      if (merged.sort === "DESC" && store.count > 0) {
        setStore("count", (count) => clamp(count - 1, 0, getLength()))
      } else if (merged.sort === "ASC" && getLength() > store.count) {
        setStore("count", (count) => count + 1)
      } else if (isHasMore()) {
        await props.next()
      }
    } finally {
      setTimeout(() => {
        setStore("isLoading", false)
        if (visibleObserver() && !store.isLoading) {
          handleNext()
        }
      }, 0)
    }
  }

  createEffect(
    on(getLength, (next, prev) => {
      if (prev === undefined) return

      if (merged.sort === "DESC") {
        setStore("count", next - prev)
      }
    }),
  )

  createEffect(
    on(
      visibleObserver,
      (visibleObserver) => {
        if (store.isLoading) {
          return
        }
        if (!visibleObserver) {
          return
        }

        handleNext()
      },
      {
        defer: true,
      },
    ),
  )

  createEffect(() => {
    if (!isHasMore()) {
      setStore("isLoading", false)
    }
  })

  return (
    <div
      class={style.InfiniteScroll}
      classList={{
        "_InfiniteScroll--reverse": merged.reverse,
      }}
    >
      <div
        style={{
          gap: props.gap,
        }}
        class={style.InfiniteScroll__in}
        ref={contentRef!}
      >
        {/** FIXME: При изменении  getLength() не добавляется элементы*/}
        <For
          each={Array.from({
            length: getLength(),
          }).slice(
            merged.sort === "DESC" ? store.count : 0,
            merged.sort === "DESC" ? getLength() : store.count,
          )}
        >
          {(_, pageIndex) => {
            const min = pageIndex() * merged.count
            const max = min + merged.count

            return (
              <ScrollOverflowItem
                scrollThreshold={merged.scrollThreshold}
                contentRef={contentRef!}
                zIndex={(props.each || []).length - pageIndex()}
                reverse={props.reverse}
                lastClassList={{
                  _InfiniteScroll__items: true,
                  ["_firstChild"]: pageIndex() === 0,
                  ["_lastChild"]: pageIndex() === (props.each || []).length - 1,
                }}
                notLast={pageIndex() < (props.each || []).length - 1}
                gap={merged.gap}
              >
                <For each={props.each?.slice(min, max)}>
                  {(item, index) =>
                    props.children(item, () => index() + pageIndex() * merged.count)
                  }
                </For>
              </ScrollOverflowItem>
            )
          }}
        </For>
      </div>
      <div
        ref={observerRef!}
        class={style.InfiniteScroll__observe}
        style={{
          top: merged.reverse ? 0 : "",
          bottom: !merged.reverse ? 0 : "",
          position: "absolute",
          width: "100%",
          height: Math.abs(merged.scrollThreshold) + "px",
          // "margin-bottom": "-" + Math.abs(merged.scrollThreshold) + "px",
        }}
      />
      <Show when={store.isLoading}>
        <Switch
          fallback={
            <Plug>
              <Spinner color={"secondary"} />
            </Plug>
          }
        >
          <Match when={!!props.loadingMessage}>
            <div>{props.loadingMessage}</div>
          </Match>
        </Switch>
      </Show>
      <Show when={!isHasMore()} children={props.endMessage} />
    </div>
  )
}

export default InfiniteScroll

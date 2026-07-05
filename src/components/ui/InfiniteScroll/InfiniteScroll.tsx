import style from "./InfiniteScroll.module.css"

import {
  type Accessor,
  type JSX,
  createEffect,
  createMemo,
  createSignal,
  For,
  Match,
  mergeProps,
  on,
  onCleanup,
  onMount,
  Show,
  Switch,
  untrack,
} from "solid-js"
import { createVisibilityObserver } from "@solid-primitives/intersection-observer"

import Plug from "@ui/Blocks/Plug/Plug"
import Spinner from "@ui/Blocks/Spinner/Spinner"

import ScrollOverflowItem from "./ScrollOverflowItem"
import { createStore } from "solid-js/store"

type InfiniteScroll<T, U> = {
  each: T[][] | undefined
  children: (item: T, index: Accessor<number>) => U
  next: () => Promise<unknown>
  hasMore: boolean
  loadingMessage?: JSX.Element
  endMessage?: JSX.Element
  scrollThreshold?: number

  reverse?: boolean

  gap?: string
}

function InfiniteScroll<T extends unknown, U extends JSX.Element>(props: InfiniteScroll<T, U>) {
  let contentRef: HTMLDivElement
  let observerRef: HTMLDivElement

  const merged = mergeProps({ scrollThreshold: 300, reverse: false }, props)

  const [loading, setLoading] = createSignal(false)

  const useVisibilityObserver = createVisibilityObserver({
    initialValue: false,
    root: contentRef!,
  })
  const visibleObserver = useVisibilityObserver(() => observerRef!)

  const handleNext = async () => {
    if (props.hasMore) {
      setLoading(true)
      await props.next()
      setLoading(false)

      const _loading = untrack(loading)
      if (untrack(visibleObserver) && !_loading) {
        handleNext()
      }
    }
  }

  createEffect(
    on(
      visibleObserver,
      (visibleObserver) => {
        const _loading = untrack(loading)
        if (_loading || !visibleObserver) {
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
    if (!props.hasMore) {
      setLoading(false)
    }
  })

  const empty = createMemo(
    () =>
      (props.each?.length || 0) -
      (props.each?.filter((x) => Boolean(x) && x.length !== 0).length || 0),
  )

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
        <For each={props.each}>
          {(content, rootIndex) => (
            <Show when={content.length}>
              <ScrollOverflowItem
                scrollThreshold={merged.scrollThreshold}
                contentRef={contentRef!}
                data-index={rootIndex() - empty()}
                reverse={props.reverse}
                lastClassList={{
                  _InfiniteScroll__items: true,
                  ["_firstChild"]: rootIndex() - empty() === 0,
                  ["_lastChild"]: rootIndex() - empty() === (props.each || []).length - 1,
                }}
                notLast={rootIndex() - empty() < (props.each || []).length - 1}
              >
                <For each={content?.filter(Boolean)}>
                  {(item, index) =>
                    props.children(
                      item,
                      () => index() + (props.each?.[0]?.length || 0) * (rootIndex() - empty()),
                    )
                  }
                </For>
              </ScrollOverflowItem>
            </Show>
          )}
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
      <Show when={loading()}>
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
      <Show when={!props.hasMore} children={props.endMessage} />
    </div>
  )
}

export default InfiniteScroll
